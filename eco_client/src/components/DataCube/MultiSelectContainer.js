//https://github.com/dowjones/react-dropdown-tree-select/issues/313
//https://codesandbox.io/s/aged-field-uxkrf?fontsize=14&hidenavigation=1&theme=dark&file=/src/dropdownTree.container.js

import { memo } from "preact/compat"; //React
import DropdownTreeSelect from "react-dropdown-tree-select";

export const MultiSelectContainer = memo((props) => { //React.
  return <DropdownTreeSelect {...props} />;
});

