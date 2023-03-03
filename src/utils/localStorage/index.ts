// 取
export const getItems = (key: string) => {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
};

// 存
export const setItems = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// 删
export const delItems = (key: string) => {
  localStorage.removeItem(key);
};
