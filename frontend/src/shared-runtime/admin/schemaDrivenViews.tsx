import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  List,
  NumberField,
  NumberInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";
import { useSchema } from "./schemaContext";
import type { AttributeType, ResourcePages } from "./resourceMetadata";

function renderField(source: string, type: AttributeType) {
  switch (type) {
    case "number":
      return <NumberField key={source} source={source} />;
    case "boolean":
      return <BooleanField key={source} source={source} />;
    case "datetime":
      return <DateField key={source} source={source} showTime />;
    default:
      return <TextField key={source} source={source} />;
  }
}

function renderInput(source: string, type: AttributeType, disabled: boolean) {
  switch (type) {
    case "number":
      return <NumberInput key={source} source={source} disabled={disabled} />;
    case "boolean":
      return <BooleanInput key={source} source={source} disabled={disabled} />;
    case "datetime":
      return <DateInput key={source} source={source} disabled={disabled} />;
    default:
      return <TextInput key={source} source={source} disabled={disabled} fullWidth />;
  }
}

export function makeSchemaDrivenPages(resourceName: string): ResourcePages {
  const ListPage = () => {
    const schema = useSchema().resources[resourceName];
    return (
      <List>
        <Datagrid rowClick="show">
          {Object.entries(schema.attributes).map(([source, meta]) =>
            renderField(source, meta.type),
          )}
        </Datagrid>
      </List>
    );
  };

  const CreatePage = () => {
    const schema = useSchema().resources[resourceName];
    return (
      <Create>
        <SimpleForm>
          {Object.entries(schema.attributes)
            .filter(([, meta]) => !meta.readonly)
            .map(([source, meta]) => renderInput(source, meta.type, false))}
        </SimpleForm>
      </Create>
    );
  };

  const EditPage = () => {
    const schema = useSchema().resources[resourceName];
    return (
      <Edit>
        <SimpleForm>
          {Object.entries(schema.attributes).map(([source, meta]) =>
            renderInput(source, meta.type, Boolean(meta.readonly)),
          )}
        </SimpleForm>
      </Edit>
    );
  };

  const ShowPage = () => {
    const schema = useSchema().resources[resourceName];
    return (
      <Show>
        <SimpleShowLayout>
          {Object.entries(schema.attributes).map(([source, meta]) =>
            renderField(source, meta.type),
          )}
        </SimpleShowLayout>
      </Show>
    );
  };

  return {
    name: resourceName,
    list: ListPage,
    create: CreatePage,
    edit: EditPage,
    show: ShowPage,
    recordRepresentation: "id",
  };
}
