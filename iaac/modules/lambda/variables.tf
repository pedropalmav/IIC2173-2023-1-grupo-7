variable "lambda_name" {
  description = "Name of the lambda function."
  type        = string
}

variable "filename" {
  description = "Name of the source zip file."
  type        = string
}

variable "tags" {
  description = "Tags to set on the lambda."
  type        = map(string)
  default     = {}
}

variable "role_arn"{
    description = "ARN of the role to attach to the lambda."
    type        = string
}