import Form from '@rjsf/mui';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import React from 'react';

const schema: RJSFSchema = {
  title: 'Test form',
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      format: 'password',
    },
  },
};

export const SignInForm: React.FC = () => {
  return (
    <Form
      schema={schema}
      validator={validator}
      onSubmit={({ formData }) => console.log(formData)}
      noHtml5Validate
      showErrorList={false}
    />
  );
};
