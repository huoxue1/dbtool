import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { useModel } from '@umijs/max';
import { Form, Input, Select, Switch, Button, message } from 'antd';
import React from 'react';
import { supportDriver,getDriver } from '@/core/core';
import { getFieldComponent } from '@/utils/field';
import connectionStorage from '@/utils/connection';


const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

class CreateConnection extends React.Component {
    state: {
        driver: string;
        use_connection_string: boolean;
        connectionString: string;
    } = {
        driver: supportDriver()[0],
        use_connection_string: false,
        connectionString: "",
    };

    private onSubmit = async (values: any) => {
        values.driver = this.state.driver;
        console.log(this.state.connectionString);
        let driver = getDriver(values.driver);

        let db = await driver.connect(values.name, this.state.connectionString, new Map(Object.entries(values)));

        if (db) {
            let databases = await db.getDatabases();
            message.success(`连接成功，数据库: ${databases.length}个数据库`);
            connectionStorage.setItem(values.name, {
                name: values.name,
                connectionString: this.state.connectionString,
                ...Object.fromEntries(Object.entries(values)),
            });
        }

    }

    render() {
        return (
            <div>
                <Form {...formItemLayout} onFinish={this.onSubmit}>
                    <Form.Item label="驱动" name="driver">
                        <Select defaultValue={supportDriver()[0]} options={supportDriver().map(item => ({ label: item, value: item }))}  onChange={(value) => {
                            this.setState({ driver: value });
                        }}/>
                    </Form.Item>

                    {/* 连接名称 */}
                    <Form.Item label="连接名称" name="name">
                        <Input />
                    </Form.Item>
                   
                    <Form.Item label="连接字符串" name="connectionString">
                        <Input placeholder={getDriver(this.state.driver).getConnectionStringPlaceholder()} onChange={(e) => {
                            this.setState({use_connection_string: e.target.value.length > 0,connectionString: e.target.value});
                        }} />
                    </Form.Item>
                     
                    {
                        // 不使用连接字符串，就把支持的字段解析出来
                        !this.state.use_connection_string && (
                            getDriver(this.state.driver).supportFields().map(item => (
                                <Form.Item label={item.key} initialValue={item.default} required={item.required}  name={item.key}>
                                    {getFieldComponent(item)}
                                </Form.Item>
                            ))
                        )
                    }
                    {/* 提交按钮，需要居中 */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{display: 'block', margin: '0 auto'}}>提交</Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

export default CreateConnection;
