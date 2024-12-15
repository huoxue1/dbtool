// 更新连接

import { Button, Form, Input, message, Select } from "antd";
import React from "react";
import { getDriver, supportDriver } from "@/core/core";
import connectionStorage from "@/utils/connection";
import { getFieldComponent } from "@/utils/field";

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };


class UpdateConnection extends React.Component {

    state:{
        connection_name: string,
        connectionString: string,
        connection: any,

        allConnection: any[],
    } = {
        connection_name: "",
        connectionString: "",
        connection: null,
        allConnection: [],
    }

    formRef = React.createRef<any>();

    componentDidMount() {
            connectionStorage.getALlAsync().then(res => {
                this.setState({
                    allConnection: res,
                    connection_name: res.length > 0 ? res[0].value.name : "",
                });
            });
    }

    onSubmit = async (values: any) => {
        let conn = connectionStorage.getItem(this.state.connection_name);
        conn.connectionString = this.state.connectionString;
        conn.driver = values.driver;
        conn.name = this.state.connection_name;
        let driver = getDriver(values.driver);
        let db = await driver.connect(this.state.connection_name, this.state.connectionString, new Map(Object.entries(values)));
        if (db) {
            let databases = await db.getDatabases();
            message.success(`连接成功，数据库: ${databases.length}个数据库`);
            connectionStorage.setItem(this.state.connection_name, conn);
        }
    }

    render() {
        return <>
                <Form ref={this.formRef}  {...formItemLayout} onFinish={this.onSubmit}>
                    <Form.Item initialValue={this.state.connection_name} label="名称" name="name">
                        <Select options={this.state.allConnection.map(item => ({ label: item.value.name, value: item.value.name }))} onChange={(value)=>{
                            let conn = connectionStorage.getItem(value);
                            this.setState({
                                connection_name: value,
                                connection: conn,
                                connectionString: conn.connectionString,
                            });
                            this.formRef.current?.setFieldsValue(conn);
                        }} />
                    </Form.Item>
   
                    <Form.Item label="驱动" name="driver">
                        <Select options={supportDriver().map(item => ({ label: item, value: item }))} />
                    </Form.Item>
                    <Form.Item label="连接字符串"  name="connectionString">
                        <Input onChange={(e) => {
                            this.setState({
                                connectionString: e.target.value,
                            });
                        }}  />
                    </Form.Item>

                    {
                        this.state.connection && this.state.connectionString.length == 0 && getDriver(this.state.connection?.driver).supportFields().map(item => (
                            <Form.Item label={item.key} initialValue={item.default} required={item.required}  name={item.key}>
                                {getFieldComponent(item)}
                            </Form.Item>
                        ))
                    }
                    <Form.Item wrapperCol={{ offset: 6 }}>
                        <Button type="primary" htmlType="submit" >保存</Button>
                    </Form.Item>

                </Form>
        </>;
    }
}

export default UpdateConnection;
