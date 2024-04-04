resource "aws_cloudfront_distribution" "cloudfront" {
  origin {
    domain_name = var.bucket_domain_name
    origin_id   = var.bucket_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cloudfront_access_identity.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2"

  default_cache_behavior {
    target_origin_id     = var.bucket_id
    allowed_methods      = ["GET", "HEAD"]
    cached_methods       = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

resource "aws_cloudfront_origin_access_identity" "cloudfront_access_identity" {
  comment = "CloudFront Origin Access Identity"

  depends_on = [
    aws_s3_bucket_policy.cloudfront_policy,
  ]
}

resource "aws_s3_bucket_policy" "cloudfront_policy" {
  bucket = var.bucket_id

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Sid       = "Grant CloudFront access to S3 bucket"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${var.bucket_arn}/*"
        Condition = {
          StringLike = {
            "aws:Referer" = "http://*cloudfront.amazonaws.com*"
          }
        }
      },
    ]
  })
}
