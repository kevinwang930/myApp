# Copyright 2020 gRPC authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""The Python AsyncIO implementation of the GRPC JsPython server."""

import logging
import asyncio
import grpc
import os
from dotenv import load_dotenv
import importlib

from google.protobuf import empty_pb2

empty = empty_pb2.Empty()

import jsPython_pb2
import jsPython_pb2_grpc
import sys
import os

# load_dotenv()
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="[python] [%(levelname)s] (%(filename)s) %(funcName)s(%(lineno)d): %(message)s",
)

from serverAction import (
    orderExcelReport_openpyxl,
    loadConfig,
    setOutputPath as config_setOutputPath,
    setTemplatePath as config_setTemplatePath,
    setSqlitePath as config_setSqlitePath,
    sqliteDisconnect as config_sqliteDisconnect,
)


class JsPythonServer(jsPython_pb2_grpc.CommunicationServicer):
    async def sayHello(
        self, request: jsPython_pb2.HelloRequest, context: grpc.aio.ServicerContext
    ) -> jsPython_pb2.HelloReply:
        print(request.name)
        return jsPython_pb2.HelloReply(message="Hello from server")

    async def orderExcelReport(self, request, context):

        result, message = orderExcelReport_openpyxl(request.orderNo)
        return jsPython_pb2.orderExportReply(result=result, message=message)

    async def supplierReportPdf(self, request, context):
        return jsPython_pb2.resultWithMessage(True, "this is supplier report test")

    async def reloadConfig(self, request, context):
        loadConfig()
        return empty

    async def setOutputPath(self, request, context):
        config_setOutputPath(request.path)
        return empty

    async def setSqlitePath(self, request, context):
        config_setSqlitePath(request.path)
        return empty

    async def setTemplatePath(self, request, context):
        config_setTemplatePath(request.path)
        return empty

    async def sqliteDisconnect(self, request, context):
        config_sqliteDisconnect()
        return empty


async def serve() -> None:
    server = grpc.aio.server()
    jsPython_pb2_grpc.add_CommunicationServicer_to_server(JsPythonServer(), server)
    listen_addr = "localhost:50051"
    server.add_insecure_port(listen_addr)
    logging.info(f"python server start on %s pid {os.getpid()}", listen_addr)
    sys.stdout.write(f"python server start on {listen_addr} pid {os.getpid()}")
    await server.start()
    try:
        await server.wait_for_termination()
    except KeyboardInterrupt:
        # Shuts down the server with 0 seconds of grace period. During the
        # grace period, the server won't accept new connections and allow
        # existing RPCs to continue within the grace period.
        await server.stop(0)


if __name__ == "__main__":

    # logging.info(f'python server start {os.getpid()}')
    env = os.getenv("PYTHON_ENV", "production").upper()
    if env == "DEBUG":
        # debugpy = importlib.import_module('debugpy')
        import debugpy

        try:
            debugpy.connect(9223)
            logging.debug("python service connect to debugger succeed")
        except:
            logging.debug("python service connect to debugger failed")

    asyncio.run(serve())
