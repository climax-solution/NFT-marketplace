origin=http://localhost:5001
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["'"$origin"'", "http://127.0.0.1:8080","http://localhost:3000", "http://127.0.0.1:48084", "https://gateway.ipfs.io", "https://webui.ipfs.io"]'
ipfs config API.HTTPHeaders.Access-Control-Allow-Origin