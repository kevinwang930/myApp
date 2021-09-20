import grpc
import asyncio
import jsPython_pb2
import jsPython_pb2_grpc
async def run() -> None:
    async with grpc.aio.insecure_channel('localhost:50051') as channel:
        stub = jsPython_pb2_grpc.CommunicationStub(channel)
        response = await stub.sayHello(jsPython_pb2.HelloRequest(name='you'))
        print("Greeter client received: " + response.message)
        response1 = await stub.exportOrderToExcel(jsPython_pb2.orderExportRequest(orderNo="01"))
        print('export order reply message '+response1.message)


if __name__ == '__main__':
    # logging.basicConfig()
    asyncio.run(run())