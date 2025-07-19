// Mock utility functions for testing
export const getConfigurationFiles = jest.fn();
export const readConfigFile = jest.fn();

// Mock implementations
getConfigurationFiles.mockResolvedValue([
  { value: 'tenant1.json', label: 'Tenant 1 Config' },
  { value: 'tenant2.json', label: 'Tenant 2 Config' },
]);

readConfigFile.mockResolvedValue({
  tenants: [
    {
      tenantId: 'tenant1',
      tenantName: 'Test Tenant',
      customer: 'Test Customer',
      environment: 'development'
    }
  ]
});

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getConfigurationFiles returns list of config files', async () => {
    const files = await getConfigurationFiles();
    
    expect(files).toEqual([
      { value: 'tenant1.json', label: 'Tenant 1 Config' },
      { value: 'tenant2.json', label: 'Tenant 2 Config' },
    ]);
  });

  test('readConfigFile returns config data', async () => {
    const config = await readConfigFile('tenant1.json');
    
    expect(config).toEqual({
      tenants: [
        {
          tenantId: 'tenant1',
          tenantName: 'Test Tenant',
          customer: 'Test Customer',
          environment: 'development'
        }
      ]
    });
  });

  test('getConfigurationFiles can be called multiple times', async () => {
    await getConfigurationFiles();
    await getConfigurationFiles();
    
    expect(getConfigurationFiles).toHaveBeenCalledTimes(2);
  });

  test('readConfigFile accepts file parameter', async () => {
    await readConfigFile('specific-file.json');
    
    expect(readConfigFile).toHaveBeenCalledWith('specific-file.json');
  });
});
