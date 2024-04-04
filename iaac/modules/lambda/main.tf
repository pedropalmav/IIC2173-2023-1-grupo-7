resource "aws_lambda_function" "my_lambda_function" {
    function_name    = var.lambda_name
    handler          = "index.handler"
    runtime          = "nodejs16.x"
    role             = var.role_arn
    filename         = var.filename
    

  tags = var.tags
}

output "lambda_function_arn" {
  value = aws_lambda_function.my_lambda_function.invoke_arn
}
