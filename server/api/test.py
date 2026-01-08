def handler(request):
    return {
        "statusCode": 200,
        "body": '{"message": "Backend is working!"}',
        "headers": {
            "Content-Type": "application/json"
        }
    }