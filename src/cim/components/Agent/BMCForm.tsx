import * as React from 'react';
import * as yaml from 'js-yaml';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Grid,
  GridItem,
  ModalBoxBody,
  ModalBoxFooter,
  Text,
  TextInputTypes,
  TextVariants,
} from '@patternfly/react-core';
import { Formik, FormikProps, FormikConfig, FieldArray, useField } from 'formik';
import * as Yup from 'yup';
import { InfraEnvK8sResource } from '../../types';
import {
  hostnameValidationSchema,
  InputField,
  ipOrDomainValidationSchema,
  macAddressValidationSchema,
  CodeField,
  getFieldId,
} from '../../../common';
import { Language } from '@patternfly/react-code-editor';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { AddBmcValues, BMCFormProps } from './types';

const MacMapping = () => {
  const [field, { touched, error }] = useField<{ macAddress: string; name: string }[]>({
    name: 'macMapping',
  });
  const fieldId = getFieldId('macMapping', 'input');
  const isValid = !(touched && error);
  return (
    <FormGroup
      fieldId={fieldId}
      label="Mac to interface name mapping"
      validated={isValid ? 'default' : 'error'}
      isRequired
    >
      <FieldArray
        name="macMapping"
        render={({ push, remove }) => (
          <Grid hasGutter>
            <GridItem span={5}>
              <Text component={TextVariants.small}>MAC address</Text>
            </GridItem>
            <GridItem span={5}>
              <Text component={TextVariants.small}>NIC</Text>
            </GridItem>
            {field.value.map((mac, index) => (
              <React.Fragment key={index}>
                <GridItem span={5}>
                  <InputField
                    name={`macMapping[${index}].macAddress`}
                    // eslint-disable-next-line
                    inputError={(error as any)?.[index]?.macAddress}
                  />
                </GridItem>
                <GridItem span={5}>
                  <InputField
                    name={`macMapping[${index}].name`}
                    // eslint-disable-next-line
                    inputError={(error as any)?.[index]?.name}
                  />
                </GridItem>
                {index !== 0 && (
                  <GridItem span={2}>
                    <MinusCircleIcon onClick={() => remove(index)} />
                  </GridItem>
                )}
              </React.Fragment>
            ))}
            <GridItem span={6}>
              <Button
                icon={<PlusCircleIcon />}
                onClick={() => push({ macAddress: '', name: '' })}
                variant="link"
                isInline
              >
                Add more
              </Button>
            </GridItem>
          </Grid>
        )}
      />
    </FormGroup>
  );
};

const getNMState = (values: AddBmcValues, infraEnv: InfraEnvK8sResource) => {
  // eslint-disable-next-line
  const config: any = yaml.load(values.nmState);
  const nmState = {
    apiVersion: 'agent-install.openshift.io/v1beta1',
    kind: 'NMStateConfig',
    metadata: {
      generateName: `${infraEnv.metadata?.name}-`,
      namespace: infraEnv.metadata?.namespace,
      labels: {
        infraEnv: infraEnv.metadata?.name,
        bmcMAC: values.bmcAddress,
      },
    },
    spec: {
      config,
      interfaces: values.macMapping.filter((m) => m.macAddress.length && m.name.length),
    },
  };
  return nmState;
};

const validationSchema = Yup.object({
  hostname: hostnameValidationSchema.required(),
  bmcAddress: ipOrDomainValidationSchema.required(),
  username: Yup.string().required(),
  password: Yup.string().required(),
  bootMACAddress: macAddressValidationSchema.required(),
  nmState: Yup.string().required(),
  macMapping: Yup.array().of(
    Yup.object().shape({
      macAddress: macAddressValidationSchema.required('MAC Address is a required field'),
      name: Yup.string().required('NIC is a required field'),
    }),
  ),
});

const emptyValues: AddBmcValues = {
  hostname: '',
  bmcAddress: '',
  username: '',
  password: '',
  bootMACAddress: '',
  disableCertificateVerification: true, // TODO(mlibra)
  online: false, // TODO(mlibra)
  nmState: '',
  macMapping: [{ macAddress: '', name: '' }],
};

const BMCForm: React.FC<BMCFormProps> = ({ onCreate, onClose, hasDHCP, infraEnv }) => {
  const [error, setError] = React.useState();

  const handleSubmit: FormikConfig<AddBmcValues>['onSubmit'] = async (values) => {
    try {
      setError(undefined);
      const nmState = hasDHCP ? undefined : getNMState(values, infraEnv);
      await onCreate(values, nmState);
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <Formik
      initialValues={emptyValues}
      isInitialValid={false}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, submitForm }: FormikProps<AddBmcValues>) => {
        return (
          <>
            <ModalBoxBody>
              <Form id="add-bmc-form">
                <InputField
                  label="Host name"
                  name="hostname"
                  placeholder="Enter the name for the Host"
                  isRequired
                />
                <InputField
                  label="Baseboard Management Controller Address"
                  name="bmcAddress"
                  placeholder="Enter an address"
                  isRequired
                />
                <InputField
                  label="Boot NIC MAC Address"
                  name="bootMACAddress"
                  placeholder="Enter an address"
                  description="The MAC address of the host's network connected NIC that wll be used to provision the host."
                  isRequired
                />
                <InputField
                  label="Username"
                  name="username"
                  placeholder="Enter a username for the BMC"
                  isRequired
                />
                <InputField
                  type={TextInputTypes.password}
                  label="Password"
                  name="password"
                  placeholder="Enter a password for the BMC"
                  isRequired
                />
                {!hasDHCP && (
                  <>
                    <CodeField
                      label="NMState"
                      name="nmState"
                      language={Language.yaml}
                      isRequired
                      description="Upload a YAML file in NMstate format that includes your network configuration (static IPs, bonds, etc.)."
                    />
                    <MacMapping />
                  </>
                )}
              </Form>
              {error && (
                <Alert
                  title="Failed to add host"
                  variant={AlertVariant.danger}
                  isInline
                  actionClose={() => setError(undefined)}
                >
                  {error}
                </Alert>
              )}
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
                Create
              </Button>
              <Button onClick={onClose} variant={ButtonVariant.secondary}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        );
      }}
    </Formik>
  );
};

export default BMCForm;
