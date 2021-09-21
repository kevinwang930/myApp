
conda deactivate
conda run --name electron python -m grpc_tools.protoc -I../../public --python_out=. --grpc_python_out=. ../../public/jsPython.proto
