import React, { useState } from 'react';
import { Select, Input, Button, Space, Card, Modal, Form, List, Typography, Tooltip } from 'antd';
import { FilterOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import type { VBIFilter } from '@visactor/vbi';

const { Option } = Select;
const { Text } = Typography;

interface FilterPanelProps {
  fields: string[];
  filters: VBIFilter[];
  onAddFilter: (filter: VBIFilter) => void;
  onUpdateFilter: (index: number, filter: Partial<VBIFilter>) => void;
  onDeleteFilter: (index: number) => void;
}

const OPERATORS = [
  { label: '等于 (=)', value: '=' },
  { label: '不等于 (!=)', value: '!=' },
  { label: '包含 (in)', value: 'in' },
  { label: '大于 (>)', value: '>' },
  { label: '小于 (<)', value: '<' },
  { label: '大于等于 (>=)', value: '>=' },
  { label: '小于等于 (<=)', value: '<=' },
  { label: '模糊匹配 (like)', value: 'like' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  fields, 
  filters = [], 
  onAddFilter, 
  onUpdateFilter, 
  onDeleteFilter 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddSubmit = () => {
    form.validateFields().then(values => {
      const { name, field, operator, value } = values;
      const finalValue = operator === 'in' ? value.split(',').map((v: string) => v.trim()) : value;
      
      onAddFilter({
        name: name || `${field} ${operator} ${value}`,
        field,
        operator,
        value: finalValue,
        enabled: true,
        id: Date.now().toString()
      });
      
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <Card 
      size="small" 
      title={<Space><FilterOutlined />数据筛选器</Space>}
      extra={<Button type="text" size="small" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} />}
      style={{ marginBottom: 16, backgroundColor: '#1f1f1f', borderColor: '#303030' }}
    >
      {filters.length === 0 ? (
        <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>
          暂无筛选条件
        </div>
      ) : (
        <List
          size="small"
          dataSource={filters}
          renderItem={(item, index) => {
            const isEnabled = item.enabled !== false;
            return (
              <List.Item
                style={{ padding: '8px 0', borderBottom: '1px solid #303030' }}
                actions={[
                  <Tooltip title={isEnabled ? '停用' : '启用'} key="toggle">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={isEnabled ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
                      onClick={() => onUpdateFilter(index, { enabled: !isEnabled })}
                      style={{ color: isEnabled ? '#1890ff' : '#666' }}
                    />
                  </Tooltip>,
                  <Tooltip title="删除" key="delete">
                    <Button 
                      type="text" 
                      size="small" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => onDeleteFilter(index)}
                    />
                  </Tooltip>
                ]}
              >
                <div style={{ display: 'flex', flexDirection: 'column', opacity: isEnabled ? 1 : 0.5, maxWidth: '140px' }}>
                  <Text style={{ fontSize: 13, color: '#e0e0e0' }} ellipsis>
                    {item.name || `${item.field} ${item.operator} ${item.value}`}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#888' }} ellipsis>
                    {item.field} {item.operator} {String(item.value)}
                  </Text>
                </div>
              </List.Item>
            );
          }}
        />
      )}

      <Modal
        title="新增筛选器"
        open={isModalOpen}
        onOk={handleAddSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="添加"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ operator: '=' }}>
          <Form.Item label="名称 (可选)" name="name">
            <Input placeholder="例如：华东区大客户" />
          </Form.Item>
          <Form.Item label="字段" name="field" rules={[{ required: true, message: '请选择字段' }]}>
            <Select placeholder="选择要筛选的字段" showSearch>
              {fields.map(f => (
                <Option key={f} value={f}>{f}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="操作符" name="operator" rules={[{ required: true }]}>
            <Select>
              {OPERATORS.map(op => (
                <Option key={op.value} value={op.value}>{op.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="筛选值" name="value" rules={[{ required: true, message: '请输入筛选值' }]}>
            <Input placeholder="输入筛选值 (in操作符用逗号分隔)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};