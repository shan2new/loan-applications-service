# Security module - IAM roles and security groups

# Security group for Elastic Beanstalk instances
resource "aws_security_group" "eb_instances" {
  name        = "${var.prefix}-eb-instances-sg"
  description = "Security group for Elastic Beanstalk instances"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.prefix}-eb-instances-sg"
    Environment = var.environment
  }
}

# Security group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.prefix}-rds-sg"
  description = "Security group for RDS database"
  vpc_id      = var.vpc_id

  # No direct ingress from internet
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eb_instances.id, aws_security_group.codebuild.id]
    description     = "Allow PostgreSQL from EB instances and CodeBuild"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.prefix}-rds-sg"
    Environment = var.environment
  }
}

# Security group for CodeBuild
resource "aws_security_group" "codebuild" {
  name        = "${var.prefix}-codebuild-sg"
  description = "Security group for CodeBuild projects"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.prefix}-codebuild-sg"
    Environment = var.environment
  }
}

# IAM Role for Elastic Beanstalk EC2 instances
resource "aws_iam_role" "eb_ec2" {
  name = "${var.prefix}-eb-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.prefix}-eb-ec2-role"
  }
}

# IAM instance profile for Elastic Beanstalk EC2 instances
resource "aws_iam_instance_profile" "eb_ec2" {
  name = "${var.prefix}-eb-ec2-instance-profile"
  role = aws_iam_role.eb_ec2.name
}

# Policy for Elastic Beanstalk EC2 instances to access CloudWatch Logs
resource "aws_iam_role_policy" "eb_ec2_logs" {
  name = "${var.prefix}-eb-ec2-logs-policy"
  role = aws_iam_role.eb_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Policy for Elastic Beanstalk EC2 instances to access Secrets Manager
resource "aws_iam_role_policy" "eb_ec2_secrets" {
  name = "${var.prefix}-eb-ec2-secrets-policy"
  role = aws_iam_role.eb_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Effect   = "Allow"
        Resource = var.secrets_manager_arn == null ? "*" : var.secrets_manager_arn
      }
    ]
  })
}

# Policy for Elastic Beanstalk EC2 instances to access SSM Parameter Store
resource "aws_iam_role_policy" "eb_ec2_ssm" {
  name = "${var.prefix}-eb-ec2-ssm-policy"
  role = aws_iam_role.eb_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Policy for Elastic Beanstalk EC2 instances to use Systems Manager
resource "aws_iam_role_policy_attachment" "eb_ec2_ssm_managed_instance" {
  role       = aws_iam_role.eb_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Additional SSM Session Manager permissions
resource "aws_iam_role_policy" "eb_ec2_ssm_session" {
  name = "${var.prefix}-eb-ec2-ssm-session-policy"
  role = aws_iam_role.eb_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:StartSession",
          "ssm:TerminateSession",
          "ssm:ResumeSession",
          "ssm:DescribeSessions",
          "ssm:GetConnectionStatus"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Add S3 access policy for Elastic Beanstalk EC2 instances
resource "aws_iam_role_policy" "eb_ec2_s3" {
  name = "${var.prefix}-eb-ec2-s3-policy"
  role = aws_iam_role.eb_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:Get*",
          "s3:List*",
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::elasticbeanstalk-*",
          "arn:aws:s3:::elasticbeanstalk-*/*"
        ]
      }
    ]
  })
}

# Add Elastic Beanstalk Web Tier policy (includes S3 permissions)
resource "aws_iam_role_policy_attachment" "eb_ec2_web_tier" {
  role       = aws_iam_role.eb_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

# Add Elastic Beanstalk Multicontainer Docker policy (more comprehensive permissions)
resource "aws_iam_role_policy_attachment" "eb_ec2_multicontainer" {
  role       = aws_iam_role.eb_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

# IAM Role for CodePipeline
resource "aws_iam_role" "codepipeline" {
  name = "${var.prefix}-codepipeline-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.prefix}-codepipeline-role"
  }
}

# IAM Policy for CodePipeline
resource "aws_iam_role_policy" "codepipeline" {
  name = "${var.prefix}-codepipeline-policy"
  role = aws_iam_role.codepipeline.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning",
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "elasticbeanstalk:*",
          "ec2:*",
          "elasticloadbalancing:*",
          "autoscaling:*",
          "cloudwatch:*",
          "s3:*",
          "sns:*",
          "cloudformation:*",
          "rds:*",
          "sqs:*",
          "ecs:*"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "codestar-connections:UseConnection",
          "codestar-connections:GetConnection",
          "codestar-connections:ListConnections"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:PutRetentionPolicy",
          "logs:DeleteLogGroup",
          "logs:DeleteLogStream",
          "logs:GetLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# IAM Role for CodeBuild
resource "aws_iam_role" "codebuild" {
  name = "${var.prefix}-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.prefix}-codebuild-role"
  }
}

# IAM Policy for CodeBuild
resource "aws_iam_role_policy" "codebuild" {
  name = "${var.prefix}-codebuild-policy"
  role = aws_iam_role.codebuild.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeDhcpOptions",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeVpcs",
          "ec2:CreateNetworkInterfacePermission",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Attach AmazonVPCFullAccess policy to the CodeBuild role for VPC access
resource "aws_iam_role_policy_attachment" "codebuild_vpc_access" {
  role       = aws_iam_role.codebuild.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonVPCFullAccess"
}
