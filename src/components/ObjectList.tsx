import React, { useState } from "react";

export interface CanvasObject {
  id: string;
  value: string;
  custom: boolean; // true for custom input, false for Excel variable
  options: {
    qr: boolean;
    barcode: boolean;
    text: boolean;
  };
}

interface ObjectListProps {
  objects: CanvasObject[];
  setObjects: (objects: CanvasObject[]) => void;
}

const ObjectList: React.FC<ObjectListProps> = ({ objects, setObjects }) => {
  const [inputValue, setInputValue] = useState("");

  const addCustomObject = () => {
    if (!inputValue.trim()) return;
    const newObj: CanvasObject = {
      id: Date.now().toString(),
      value: inputValue.trim(),
      custom: true,
      options: {
        qr: false,
        barcode: false,
        text: false,
      },
    };
    setObjects([...objects, newObj]);
    setInputValue("");
  };

  const updateOption = (
    id: string,
    option: keyof CanvasObject["options"],
    checked: boolean
  ) => {
    const updated = objects.map((obj) =>
      obj.id === id
        ? { ...obj, options: { ...obj.options, [option]: checked } }
        : obj
    );
    setObjects(updated);
  };

  const removeObject = (id: string) => {
    setObjects(objects.filter((obj) => obj.id !== id));
  };

  return (
    <div className="w-full max-w-4xl bg-gray-800 rounded-lg p-4 shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-primary">Object List</h2>
      {/* Add Custom Object */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Enter custom object value"
          className="flex-1 p-2 rounded-l-md border border-gray-600 bg-gray-700 text-lightText"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          onClick={addCustomObject}
          className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-secondary transition"
        >
          Add
        </button>
      </div>
      {/* List of Objects */}
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="px-2 py-1">Value</th>
            <th className="px-2 py-1">QR</th>
            <th className="px-2 py-1">Barcode</th>
            <th className="px-2 py-1">Text</th>
            <th className="px-2 py-1">Remove</th>
          </tr>
        </thead>
        <tbody>
          {objects.map((obj) => (
            <tr key={obj.id} className="border-t border-gray-600">
              <td className="px-2 py-1">{obj.value}</td>
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  checked={obj.options.qr}
                  onChange={(e) => updateOption(obj.id, "qr", e.target.checked)}
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  checked={obj.options.barcode}
                  onChange={(e) =>
                    updateOption(obj.id, "barcode", e.target.checked)
                  }
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="checkbox"
                  checked={obj.options.text}
                  onChange={(e) =>
                    updateOption(obj.id, "text", e.target.checked)
                  }
                />
              </td>
              <td className="px-2 py-1">
                <button
                  onClick={() => removeObject(obj.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ObjectList;
