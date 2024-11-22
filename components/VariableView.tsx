/*
 * puffMob: A mobile client for Pufferpanel
 * Copyright (C) 2024 powermaker450
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import haptic from "@/util/haptic";
import { BooleanVariable, NumberVariable, PufferpanelVariable, ServerDataResponse, StringVariable } from "@/util/models";
import { useEffect, useState } from "react";
import { Checkbox, List, Text, TextInput, useTheme } from "react-native-paper";

interface VariableViewProps {
  variable: PufferpanelVariable;
  variableKey: string;
  res: ServerDataResponse;
  setData: React.Dispatch<React.SetStateAction<ServerDataResponse | undefined>>;
}

const VariableView = ({ variable, variableKey, res, setData }: VariableViewProps) => {
  const theme = useTheme();

  const sectionStyle = {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 20
  };

  if (variable.type === "string") {
    const [val, setVal] = useState(variable.value);

    useEffect(() => {
      (res.data[variableKey] as StringVariable).value = val;
      setData(res);
    }, [val])

    return (
      <List.Section style={sectionStyle}>
        <TextInput
          mode="outlined"
          multiline
          label={variable.display}
          value={val}
          onChangeText={text => setVal(text)}
          style={{ marginBottom: 10 }}
        />

        <Text variant="labelSmall" style={{ marginLeft: 10 }} >{variable.desc}</Text>
      </List.Section>
    );
  }

  if (variable.type === "boolean") {
    const [val, setVal] = useState(variable.value);

    useEffect(() => {
      (res.data[variableKey] as BooleanVariable).value = val;
      setData(res);
    }, [val])

    return (
      <List.Item
        title={variable.display}
        style={sectionStyle}
        onPress={() => {
          haptic(val ? "contextClick" : "soft");
          setVal(!val);
        }}
        description={variable.desc}
        right={() => <Checkbox status={val ? "checked" : "unchecked"} />}
      />
    );
  }

  if (variable.type === "integer") {
    const [val, setVal] = useState(variable.value.toString());

    useEffect(() => {
      (res.data[variableKey] as NumberVariable).value = Number(val);
      setData(res);
    }, [val]);

    return (
      <List.Section style={sectionStyle}>
        <TextInput
          mode="outlined"
          label={variable.display}
          value={val}
          onChangeText={text => setVal(text.replaceAll(/\D+/g, ""))}
          style={{ marginBottom: 10 }}
        />

        <Text variant="labelSmall" style={{ marginLeft: 10 }}>{variable.desc}</Text>
      </List.Section>
    )
  }
}

export default VariableView;
