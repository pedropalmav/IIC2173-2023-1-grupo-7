variable "name" {
  description = "Name of the api gateway."
  type        = string
}

variable "tags" {
  description = "Tags to set on the api gateway."
  type        = map(string)
  default     = {}
}

variable "description" {
  description = "Description of the API Gateway"
  type        = string
}

variable "resource_path" {
  description = "Path part for the API Gateway resource"
  type        = string

}

variable "lambda_function_arn" {
  description = "ARN of the Lambda function to integrate"
  type        = string
}

variable "stage_name" {
  description = "Name of the API Gateway deployment stage"
  type        = string
}