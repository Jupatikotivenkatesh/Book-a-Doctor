import React, { useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onChange,
  defaultValue = "",
  style,
  size = "large",
  loading = false,
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e) => {
    setValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <Search
      prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
      placeholder={placeholder}
      size={size}
      value={value}
      onChange={handleChange}
      onSearch={onSearch}
      loading={loading}
      allowClear
      enterButton="Search"
      style={{ borderRadius: 8, ...style }}
    />
  );
};

export default SearchBar;
