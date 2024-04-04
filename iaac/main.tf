terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.49.0"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

module "s3-frontend" {
  source      = "./modules/s3"
  bucket_name = "frontend-grupox"

  tags = {
    Terraform   = "true"
    Environment = "staging"
  }
}

module "s3-pdf" {
  source      = "./modules/s3"
  bucket_name = "pdf-grupox"

  tags = {
    Terraform   = "true"
    Environment = "staging"
  }
}

module "cloudfront" {
  source = "./modules/cloudfront"
  bucket_id = module.s3-frontend.name
  bucket_domain_name = module.s3-frontend.domain_name
  bucket_arn = module.s3-frontend.arn

  depends_on = [
    module.s3-frontend,
  ]
}

module "ticketseller-ec2" {
  source = "./modules/ec2"

  tags = {
    Name        = "ticketseller"
    Terraform   = "true"
    Environment = "staging"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }   
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

module "user-validation-lambda" {
  source = "./modules/lambda"
  lambda_name = "user-validation"
  filename = "./modules/lambda/test.zip"
  role_arn = aws_iam_role.lambda_role.arn

  tags = {
    Name        = "user-validation"
    Terraform   = "true"
    Environment = "staging"
  }
}

module "pdf-lambda" {
  source = "./modules/lambda"
  lambda_name = "pdf-generator"
  filename = "./modules/lambda/test.zip"
  role_arn = aws_iam_role.lambda_role.arn

  tags = {
    Name        = "pdf-generator"
    Terraform   = "true"
    Environment = "staging"
  }
}


module "tickets-api-gateway" {
  source            = "./modules/api-gateway"
  name              = "tikcets API"
  description       = "API Gateway for ticketseller EC2"
  resource_path     = "add_money"
  lambda_function_arn = module.user-validation-lambda.arn
  stage_name        = "prod"
}

module "pdf-api-gateway" {
  source            = "./modules/api-gateway"
  name              = "pdf API"
  description       = "API Gateway for pdf generator"
  resource_path     = "convert"
  lambda_function_arn = module.pdf-lambda.arn
  stage_name       = "prod"
}

output "tickets_api_url" {
  value = module.tickets-api-gateway.api_url
}

output "pdf_api_url" {
  value = module.tickets-api-gateway.api_url
}

output "ticketseller_ssh_command" {
  value = "ssh -i ${module.ticketseller-ec2.key_name}.pem ubuntu@${module.ticketseller-ec2.elastic_ip}"
}