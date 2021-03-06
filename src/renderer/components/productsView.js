import {
    Table,
    Button,
    Divider,
    Popconfirm,
    Form,
    Input,
    message,
    notification,
} from 'antd'
import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {deleteProduct, updateProduct} from '../selectors/productsSlice'
import {unwrapResult} from '@reduxjs/toolkit'
import {
    objectTrimString_emptyToNull,
    productNoUpdateValidator,
    nonEmptyValidator,
    trimWhitespace,
    permanentErrorMessage,
} from '../auxiliary'
import {isEmpty} from 'lodash'
const {TextArea} = Input

export const ProductsView = ({products}) => {
    const dispatch = useDispatch()
    const [form] = Form.useForm()
    const [editingId, setEditingId] = useState(null)

    const isEditing = (record) => {
        return record.id === editingId
    }

    const EditableCell = ({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        validator,
        ...restProps
    }) => {
        const inputNode =
            inputType === 'textArea' ? <TextArea autoSize /> : <Input />
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{
                            margin: 0,
                        }}
                        rules={
                            validator
                                ? [
                                      {
                                          transform: trimWhitespace,
                                          validator: validator,
                                      },
                                  ]
                                : null
                        }
                    >
                        {inputNode}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        )
    }

    const onDelete = async (record) => {
        try {
            let result = await dispatch(deleteProduct({id: record.id})).unwrap()
            notification.success({
                message: '??????????????????',
                description: `${record.id}-${record.name}`,
            })
        } catch (e) {
            notification.error({
                message: '??????????????????',
                description: (
                    <div>
                        {record.id}-{record.name}
                        <br />
                        {e.message}
                    </div>
                ),
            })
        }
    }

    const DeleteHandler = ({record}) => {
        const [popConfirmVisible, setPopConfirmVisible] = useState(false)
        return (
            <Popconfirm
                title="?????????????"
                okText="??????"
                cancelText="??????"
                onConfirm={() => {
                    // log.debug('inside confirm')
                    onDelete(record)
                    // setPopConfirmVisible(false)
                }}
                visible={popConfirmVisible}
                onVisibleChange={(visible) => {
                    // log.debug('inside visible change ',visible)
                    setPopConfirmVisible(visible)
                }}
            >
                <Button type="link" style={{padding: 0, color: '#f5222d'}}>
                    ??????
                </Button>
            </Popconfirm>
        )
    }

    const UpdateHandler = ({record}) => {
        return (
            <Button
                onClick={() => {
                    edit(record)
                }}
            >
                ??????
            </Button>
        )
    }

    const edit = (record) => {
        setEditingId(record.id)
        form.setFieldsValue({
            ...record,
        })
    }

    const save = async (originalRecord) => {
        let row
        try {
            row = await form.getFieldsValue()
        } catch (e) {
            return
        }
        const updatedRecord = objectTrimString_emptyToNull(row)
        let changes = {}
        for (const [key, value] of Object.entries(updatedRecord)) {
            if (originalRecord[key] !== value) {
                changes[key] = value
            }
        }
        if (isEmpty(changes)) {
            message.warn({
                content: '??????????????????',
                key: originalRecord.id,
            })
            setEditingId(null)
            return
        }

        try {
            let result = await dispatch(
                updateProduct({id: originalRecord.id, changes: changes})
            ).unwrap()
            setEditingId(null)
            message.success({
                content: '??????????????????',
                key: originalRecord.id,
            })
        } catch (e) {
            message.error({
                content: `?????????????????? ${e}`,
                key: originalRecord.id,
            })
        }
    }

    const cancel = () => {
        setEditingId('')
    }

    const EditingHandler = ({record}) => {
        return (
            <span>
                <Button
                    onClick={async () => save(record)}
                    style={{
                        marginRight: 8,
                    }}
                >
                    ??????
                </Button>
                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                    <Button>??????</Button>
                </Popconfirm>
            </span>
        )
    }

    const operation = (text, record) => {
        const editing = isEditing(record)
        if (editing) {
            return <EditingHandler record={record} />
        } else {
            return (
                <span>
                    <UpdateHandler record={record} />
                    <Divider type="vertical" />
                    <DeleteHandler record={record} />
                </span>
            )
        }
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '5em',
            editable: false,
        },
        {
            title: '?????????',
            dataIndex: 'supplierName',
            width: '16em',
            editable: false,
        },
        {
            title: '????????????',
            dataIndex: 'productNo',
            width: '8em',
            editable: true,
            onCell: (record) => ({
                record,
                inputType: 'input',
                dataIndex: 'productNo',
                editing: isEditing(record),
                // validator:()=>{return Promise.resolve()}
                validator: (rule, value, callback) =>
                    productNoUpdateValidator(rule, value, callback, record),
            }),
        },

        {
            title: '??????',
            dataIndex: 'name',
            witdh: '16em',
            editable: true,
            onCell: (record) => ({
                record,
                inputType: 'textArea',
                dataIndex: 'name',
                editing: isEditing(record),
                validator: (rule, value, callback) =>
                    nonEmptyValidator(rule, value, callback, '??????'),
            }),
        },
        {
            title: '??????',
            dataIndex: 'description',
            editable: true,
            onCell: (record) => ({
                record,
                inputType: 'textArea',
                dataIndex: 'description',
                editing: isEditing(record),
                // validator: (rule, value, callback) => nonEmptyValidator(rule, value, callback, "??????")
            }),
        },

        {
            title: '??????',
            key: '??????',
            width: '8em',
            render: operation,
        },
    ]

    return (
        <Form form={form}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                dataSource={products}
                columns={columns}
                rowKey="id"
            />
        </Form>
    )
}
