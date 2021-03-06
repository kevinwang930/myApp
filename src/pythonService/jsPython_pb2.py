# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: jsPython.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import empty_pb2 as google_dot_protobuf_dot_empty__pb2


DESCRIPTOR = _descriptor.FileDescriptor(
  name='jsPython.proto',
  package='jsPython',
  syntax='proto3',
  serialized_options=b'\242\002\003HLW',
  create_key=_descriptor._internal_create_key,
  serialized_pb=b'\n\x0ejsPython.proto\x12\x08jsPython\x1a\x1bgoogle/protobuf/empty.proto\"\x1c\n\x0cHelloRequest\x12\x0c\n\x04name\x18\x01 \x01(\t\"\x1d\n\nHelloReply\x12\x0f\n\x07message\x18\x01 \x01(\t\"%\n\x12orderExportRequest\x12\x0f\n\x07orderNo\x18\x01 \x01(\t\"D\n\x10orderExportReply\x12\x0e\n\x06result\x18\x01 \x01(\x08\x12\x14\n\x07message\x18\x02 \x01(\tH\x00\x88\x01\x01\x42\n\n\x08_message\"+\n\x15supplierReportRequest\x12\x12\n\nsupplierId\x18\x01 \x01(\r\"E\n\x11resultWithMessage\x12\x0e\n\x06result\x18\x01 \x01(\x08\x12\x14\n\x07message\x18\x02 \x01(\tH\x00\x88\x01\x01\x42\n\n\x08_message\"\x1e\n\x0esetPathRequest\x12\x0c\n\x04path\x18\x01 \x01(\t2\x83\x04\n\rCommunication\x12:\n\x08sayHello\x12\x16.jsPython.HelloRequest\x1a\x14.jsPython.HelloReply\"\x00\x12N\n\x10orderExcelReport\x12\x1c.jsPython.orderExportRequest\x1a\x1a.jsPython.orderExportReply\"\x00\x12S\n\x11supplierPdfReport\x12\x1f.jsPython.supplierReportRequest\x1a\x1b.jsPython.resultWithMessage\"\x00\x12@\n\x0creloadConfig\x12\x16.google.protobuf.Empty\x1a\x16.google.protobuf.Empty\"\x00\x12\x43\n\rsetOutputPath\x12\x18.jsPython.setPathRequest\x1a\x16.google.protobuf.Empty\"\x00\x12\x43\n\rsetSqlitePath\x12\x18.jsPython.setPathRequest\x1a\x16.google.protobuf.Empty\"\x00\x12\x45\n\x0fsetTemplatePath\x12\x18.jsPython.setPathRequest\x1a\x16.google.protobuf.Empty\"\x00\x42\x06\xa2\x02\x03HLWb\x06proto3'
  ,
  dependencies=[google_dot_protobuf_dot_empty__pb2.DESCRIPTOR,])




_HELLOREQUEST = _descriptor.Descriptor(
  name='HelloRequest',
  full_name='jsPython.HelloRequest',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='name', full_name='jsPython.HelloRequest.name', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=57,
  serialized_end=85,
)


_HELLOREPLY = _descriptor.Descriptor(
  name='HelloReply',
  full_name='jsPython.HelloReply',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='message', full_name='jsPython.HelloReply.message', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=87,
  serialized_end=116,
)


_ORDEREXPORTREQUEST = _descriptor.Descriptor(
  name='orderExportRequest',
  full_name='jsPython.orderExportRequest',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='orderNo', full_name='jsPython.orderExportRequest.orderNo', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=118,
  serialized_end=155,
)


_ORDEREXPORTREPLY = _descriptor.Descriptor(
  name='orderExportReply',
  full_name='jsPython.orderExportReply',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='result', full_name='jsPython.orderExportReply.result', index=0,
      number=1, type=8, cpp_type=7, label=1,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='message', full_name='jsPython.orderExportReply.message', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
    _descriptor.OneofDescriptor(
      name='_message', full_name='jsPython.orderExportReply._message',
      index=0, containing_type=None,
      create_key=_descriptor._internal_create_key,
    fields=[]),
  ],
  serialized_start=157,
  serialized_end=225,
)


_SUPPLIERREPORTREQUEST = _descriptor.Descriptor(
  name='supplierReportRequest',
  full_name='jsPython.supplierReportRequest',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='supplierId', full_name='jsPython.supplierReportRequest.supplierId', index=0,
      number=1, type=13, cpp_type=3, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=227,
  serialized_end=270,
)


_RESULTWITHMESSAGE = _descriptor.Descriptor(
  name='resultWithMessage',
  full_name='jsPython.resultWithMessage',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='result', full_name='jsPython.resultWithMessage.result', index=0,
      number=1, type=8, cpp_type=7, label=1,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='message', full_name='jsPython.resultWithMessage.message', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
    _descriptor.OneofDescriptor(
      name='_message', full_name='jsPython.resultWithMessage._message',
      index=0, containing_type=None,
      create_key=_descriptor._internal_create_key,
    fields=[]),
  ],
  serialized_start=272,
  serialized_end=341,
)


_SETPATHREQUEST = _descriptor.Descriptor(
  name='setPathRequest',
  full_name='jsPython.setPathRequest',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='path', full_name='jsPython.setPathRequest.path', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=343,
  serialized_end=373,
)

_ORDEREXPORTREPLY.oneofs_by_name['_message'].fields.append(
  _ORDEREXPORTREPLY.fields_by_name['message'])
_ORDEREXPORTREPLY.fields_by_name['message'].containing_oneof = _ORDEREXPORTREPLY.oneofs_by_name['_message']
_RESULTWITHMESSAGE.oneofs_by_name['_message'].fields.append(
  _RESULTWITHMESSAGE.fields_by_name['message'])
_RESULTWITHMESSAGE.fields_by_name['message'].containing_oneof = _RESULTWITHMESSAGE.oneofs_by_name['_message']
DESCRIPTOR.message_types_by_name['HelloRequest'] = _HELLOREQUEST
DESCRIPTOR.message_types_by_name['HelloReply'] = _HELLOREPLY
DESCRIPTOR.message_types_by_name['orderExportRequest'] = _ORDEREXPORTREQUEST
DESCRIPTOR.message_types_by_name['orderExportReply'] = _ORDEREXPORTREPLY
DESCRIPTOR.message_types_by_name['supplierReportRequest'] = _SUPPLIERREPORTREQUEST
DESCRIPTOR.message_types_by_name['resultWithMessage'] = _RESULTWITHMESSAGE
DESCRIPTOR.message_types_by_name['setPathRequest'] = _SETPATHREQUEST
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

HelloRequest = _reflection.GeneratedProtocolMessageType('HelloRequest', (_message.Message,), {
  'DESCRIPTOR' : _HELLOREQUEST,
  '__module__' : 'jsPython_pb2'
  # @@protoc_insertion_point(class_scope:jsPython.HelloRequest)
  })
_sym_db.RegisterMessage(HelloRequest)

HelloReply = _reflection.GeneratedProtocolMessageType('HelloReply', (_message.Message,), {
  'DESCRIPTOR' : _HELLOREPLY,
  '__module__' : 'jsPython_pb2'
  # @@protoc_insertion_point(class_scope:jsPython.HelloReply)
  })
_sym_db.RegisterMessage(HelloReply)

orderExportRequest = _reflection.GeneratedProtocolMessageType('orderExportRequest', (_message.Message,), {
  'DESCRIPTOR' : _ORDEREXPORTREQUEST,
  '__module__' : 'jsPython_pb2'
  # @@protoc_insertion_point(class_scope:jsPython.orderExportRequest)
  })
_sym_db.RegisterMessage(orderExportRequest)

orderExportReply = _reflection.GeneratedProtocolMessageType('orderExportReply', (_message.Message,), {
  'DESCRIPTOR' : _ORDEREXPORTREPLY,
  '__module__' : 'jsPython_pb2'
  # @@protoc_insertion_point(class_scope:jsPython.orderExportReply)
  })
_sym_db.RegisterMessage(orderExportReply)

supplierReportRequest = _reflection.GeneratedProtocolMessageType('supplierReportRequest', (_message.Message,), {
  'DESCRIPTOR' : _SUPPLIERREPORTREQUEST,
  '__module__' : 'jsPython_pb2'
  # @@protoc_insertion_point(class_scope:jsPython.supplierReportRequest)
  })
_sym_db.RegisterMessage(supplierReportRequest)

resultWithMessage = _reflection.GeneratedProtocolMessageType('resultWithMessage', (_message.Message,), {
  'DESCRIPTOR' : _RESULTWITHMESSAGE,
  '__module__' : 'jsPython_pb2'
  # @@protoc_insertion_point(class_scope:jsPython.resultWithMessage)
  })
_sym_db.RegisterMessage(resultWithMessage)

setPathRequest = _reflection.GeneratedProtocolMessageType('setPathRequest', (_message.Message,), {
  'DESCRIPTOR' : _SETPATHREQUEST,
  '__module__' : 'jsPython_pb2'
  # @@protoc_insertion_point(class_scope:jsPython.setPathRequest)
  })
_sym_db.RegisterMessage(setPathRequest)


DESCRIPTOR._options = None

_COMMUNICATION = _descriptor.ServiceDescriptor(
  name='Communication',
  full_name='jsPython.Communication',
  file=DESCRIPTOR,
  index=0,
  serialized_options=None,
  create_key=_descriptor._internal_create_key,
  serialized_start=376,
  serialized_end=891,
  methods=[
  _descriptor.MethodDescriptor(
    name='sayHello',
    full_name='jsPython.Communication.sayHello',
    index=0,
    containing_service=None,
    input_type=_HELLOREQUEST,
    output_type=_HELLOREPLY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='orderExcelReport',
    full_name='jsPython.Communication.orderExcelReport',
    index=1,
    containing_service=None,
    input_type=_ORDEREXPORTREQUEST,
    output_type=_ORDEREXPORTREPLY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='supplierPdfReport',
    full_name='jsPython.Communication.supplierPdfReport',
    index=2,
    containing_service=None,
    input_type=_SUPPLIERREPORTREQUEST,
    output_type=_RESULTWITHMESSAGE,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='reloadConfig',
    full_name='jsPython.Communication.reloadConfig',
    index=3,
    containing_service=None,
    input_type=google_dot_protobuf_dot_empty__pb2._EMPTY,
    output_type=google_dot_protobuf_dot_empty__pb2._EMPTY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='setOutputPath',
    full_name='jsPython.Communication.setOutputPath',
    index=4,
    containing_service=None,
    input_type=_SETPATHREQUEST,
    output_type=google_dot_protobuf_dot_empty__pb2._EMPTY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='setSqlitePath',
    full_name='jsPython.Communication.setSqlitePath',
    index=5,
    containing_service=None,
    input_type=_SETPATHREQUEST,
    output_type=google_dot_protobuf_dot_empty__pb2._EMPTY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='setTemplatePath',
    full_name='jsPython.Communication.setTemplatePath',
    index=6,
    containing_service=None,
    input_type=_SETPATHREQUEST,
    output_type=google_dot_protobuf_dot_empty__pb2._EMPTY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
])
_sym_db.RegisterServiceDescriptor(_COMMUNICATION)

DESCRIPTOR.services_by_name['Communication'] = _COMMUNICATION

# @@protoc_insertion_point(module_scope)
