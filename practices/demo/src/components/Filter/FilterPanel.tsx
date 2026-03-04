import React, { useState } from 'react';
import { Select, Input, Button, Space, Card, Modal, Form, List, Typography, Tooltip, Radio } from 'antd';
import { FilterOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

export interface FilterItem {
  id: string;
  name: string;
  field: string;
  operator: string;
  value: any;
  isActive: boolean;
}

export interface FilterField {
  name: string;
  role: 'dimension' | 'measure';
}

interface FilterPanelProps {
  fields: FilterField[]; // 可供筛选的字段列表
  activeFields?: string[]; // 正在使用的字段
  filters: FilterItem[];
  onChange: (filters: FilterItem[]) => void;
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

export const FilterPanel: React.FC<FilterPanelProps> = ({ fields, activeFields = [], filters = [], onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm();

  const sortedFields = React.useMemo(() => {
    const activeSet = new Set(activeFields);
    return [...fields].sort((a, b) => {
      const aActive = activeSet.has(a.name);
      const bActive = activeSet.has(b.name);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
    });
  }, [fields, activeFields]);

  const selectedRole = Form.useWatch('role', form);
  const displayFields = React.useMemo(() => {
    return sortedFields.filter(f => f.role === selectedRole);
  }, [sortedFields, selectedRole]);

  const handleAddClick = () => {
    setEditingIndex(null);
    form.resetFields();
    form.setFieldsValue({ role: 'dimension', operator: '=' });
    setIsModalOpen(true);
  };

  const handleEdit = (index: number) => {
    const item = filters[index];
    const value = Array.isArray(item.value) ? item.value.join(',') : item.value;
    const fieldRole = fields.find(f => f.name === item.field)?.role || 'dimension';
    setEditingIndex(index);
    form.setFieldsValue({
      role: fieldRole,
      name: item.name,
      field: item.field,
      operator: item.operator,
      value: value,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const { name, field, operator, value } = values;
      const finalValue = operator === 'in' ? value.split(',').map((v: string) => v.trim()) : value;
      
      if (editingIndex !== null) {
        const newFilters = [...filters];
        newFilters[editingIndex] = {
          ...newFilters[editingIndex],
          name: name || `${field} ${operator} ${value}`,
          field,
          operator,
          value: finalValue,
        };
        onChange(newFilters);
      } else {
        const newFilter: FilterItem = {
          id: Date.now().toString(),
          name: name || `${field} ${operator} ${value}`,
          field,
          operator,
          value: finalValue,
          isActive: true,
        };
        onChange([...filters, newFilter]);
      }
      
      setIsModalOpen(false);
      setEditingIndex(null);
      form.resetFields();
    });
  };

  const handleToggleActive = (index: number) => {
    const newFilters = [...filters];
    newFilters[index].isActive = !newFilters[index].isActive;
    onChange(newFilters);
  };

  const handleDelete = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    onChange(newFilters);
  };

  return (
    <Card 
      size="small" 
      title={<Space><FilterOutlined />数据筛选器</Space>}
      extra={<Button type="text" size="small" icon={<PlusOutlined />} onClick={handleAddClick} />}
      style={{ marginBottom: 0 }}
      styles={{
        body: {
          padding: '12px',
        },
      }}
    >
      {filters.length === 0 ? (
        <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>
          暂无筛选条件
        </div>
      ) : (
        <List
          size="small"
          dataSource={filters}
          renderItem={(item, index) => {
            return (
              <List.Item
                style={{ padding: '8px 0' }}
                actions={[
                  <Tooltip title="编辑" key="edit">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<EditOutlined />} 
                      onClick={() => handleEdit(index)}
                      style={{ color: '#1890ff' }}
                    />
                  </Tooltip>,
                  <Tooltip title={item.isActive ? '停用' : '启用'} key="toggle">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={item.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
                      onClick={() => handleToggleActive(index)}
                      style={{ color: item.isActive ? '#1890ff' : '#999' }}
                    />
                  </Tooltip>,
                  <Tooltip title="删除" key="delete">
                    <Button 
                      type="text" 
                      size="small" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDelete(index)}
                    />
                  </Tooltip>
                ]}
              >
                <div style={{ display: 'flex', flexDirection: 'column', opacity: item.isActive ? 1 : 0.5, maxWidth: '140px' }}>
                  <Text style={{ fontSize: 13 }} ellipsis>
                    {item.name}
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
        title={editingIndex !== null ? "编辑筛选器" : "新增筛选器"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => { setIsModalOpen(false); setEditingIndex(null); }}
        okText={editingIndex !== null ? "保存" : "添加"}
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ operator: '=', role: 'dimension' }}>
          <Form.Item label="字段类型" name="role">
            <Radio.Group optionType="button">
              <Radio value="dimension">维度 (Dimension)</Radio>
              <Radio value="measure">度量 (Measure)</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入筛选器名称' }]}>
            <Input placeholder="例如：华东区大客户" />
          </Form.Item>
          <Form.Item label="字段" name="field" rules={[{ required: true, message: '请选择字段' }]}>
            <Select placeholder="选择要筛选的字段" showSearch>
              {displayFields.map(f => {
                const isActive = activeFields.includes(f.name);
                return (
                  <Option key={f.name} value={f.name}>
                    <span style={isActive ? { color: '#faad14' } : {}}>
                      {f.name} {isActive ? '(推荐)' : ''}
                    </span>
                  </Option>
                );
              })}
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
