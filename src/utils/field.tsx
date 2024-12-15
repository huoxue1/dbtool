import { Input, InputNumber, Switch, Upload, DatePicker, TimePicker, Select } from 'antd';
enum FieldType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    File = "file",
    Date = "date",
    DateTime = "datetime",
    Time = "time",
    Timestamp = "timestamp",
    Password = "password",
    Select = "select",
}
interface Field {
    key: string;
    type: FieldType;
    default?: any;
    options?: any[];
    placeholder?: string;
    required?: boolean;
}

 function getFieldComponent(field: Field): React.ReactNode {
    switch (field.type) {
        case FieldType.String:
            return <Input value={field.default} placeholder={field.placeholder} />;
        case FieldType.Number:
            return <InputNumber value={field.default} placeholder={field.placeholder} />;
        case FieldType.Boolean:
            return <Switch  />;
        case FieldType.File:
            return <Upload />;
        case FieldType.Date:
            return <DatePicker  />;
        case FieldType.DateTime:
            return <DatePicker />;
        case FieldType.Time:
            return <TimePicker />;
        case FieldType.Timestamp:
            return <DatePicker  />;
        case FieldType.Password:
            return <Input.Password  />;
        case FieldType.Select:
            return <Select options={field.options} />;
    }
}

export { FieldType, Field, getFieldComponent };
