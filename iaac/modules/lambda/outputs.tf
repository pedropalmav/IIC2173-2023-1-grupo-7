output "arn" {
  description = "ARN of lambda function"
  value       = aws_lambda_function.my_lambda_function.invoke_arn
}

output "name" {
  description = "Name (id) of the lambda function"
  value       = aws_lambda_function.my_lambda_function.id
}