import { APIClientServiceInstance } from '@/bindings/apiclient';

export const initializeSampleData = async () => {
  // Check if we already have data
  const existingCollections = await APIClientServiceInstance.GetCollections();
  if (existingCollections.length > 0) {
    return; // Data already exists
  }

  try {
    // Create sample collections
    const jsonPlaceholderCollection = await APIClientServiceInstance.CreateCollection(
      'JSONPlaceholder API',
      'Sample requests for testing with JSONPlaceholder service'
    );

    const reqresCollection = await APIClientServiceInstance.CreateCollection(
      'ReqRes API',
      'Demo requests for ReqRes API testing service'
    );

    // Create folders
    const postsFolder = await APIClientServiceInstance.CreateFolder(
      'Posts',
      jsonPlaceholderCollection.id
    );

    const usersFolder = await APIClientServiceInstance.CreateFolder(
      'Users',
      jsonPlaceholderCollection.id
    );

    // Create sample requests
    await APIClientServiceInstance.CreateRequest(
      'Get All Posts',
      'GET',
      'https://jsonplaceholder.typicode.com/posts',
      JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      '',
      jsonPlaceholderCollection.id,
      postsFolder.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Get Single Post',
      'GET',
      'https://jsonplaceholder.typicode.com/posts/1',
      JSON.stringify({
        'Accept': 'application/json'
      }),
      '',
      jsonPlaceholderCollection.id,
      postsFolder.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Create New Post',
      'POST',
      'https://jsonplaceholder.typicode.com/posts',
      JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      JSON.stringify({
        title: 'New Post',
        body: 'This is the content of the new post',
        userId: 1
      }, null, 2),
      jsonPlaceholderCollection.id,
      postsFolder.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Update Post',
      'PUT',
      'https://jsonplaceholder.typicode.com/posts/1',
      JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      JSON.stringify({
        id: 1,
        title: 'Updated Post Title',
        body: 'Updated post content',
        userId: 1
      }, null, 2),
      jsonPlaceholderCollection.id,
      postsFolder.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Delete Post',
      'DELETE',
      'https://jsonplaceholder.typicode.com/posts/1',
      JSON.stringify({
        'Accept': 'application/json'
      }),
      '',
      jsonPlaceholderCollection.id,
      postsFolder.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Get All Users',
      'GET',
      'https://jsonplaceholder.typicode.com/users',
      JSON.stringify({
        'Accept': 'application/json'
      }),
      '',
      jsonPlaceholderCollection.id,
      usersFolder.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Get User Details',
      'GET',
      'https://jsonplaceholder.typicode.com/users/1',
      JSON.stringify({
        'Accept': 'application/json'
      }),
      '',
      jsonPlaceholderCollection.id,
      usersFolder.id
    );

    // ReqRes API requests
    await APIClientServiceInstance.CreateRequest(
      'List Users',
      'GET',
      'https://reqres.in/api/users?page=2',
      JSON.stringify({
        'Accept': 'application/json'
      }),
      '',
      reqresCollection.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Create User',
      'POST',
      'https://reqres.in/api/users',
      JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      JSON.stringify({
        name: 'John Doe',
        job: 'Software Engineer'
      }, null, 2),
      reqresCollection.id
    );

    await APIClientServiceInstance.CreateRequest(
      'Login',
      'POST',
      'https://reqres.in/api/login',
      JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      JSON.stringify({
        email: 'eve.holt@reqres.in',
        password: 'cityslicka'
      }, null, 2),
      reqresCollection.id
    );

    // Create sample environments
    await APIClientServiceInstance.CreateEnvironment(
      'Development',
      JSON.stringify({
        baseUrl: 'https://jsonplaceholder.typicode.com',
        apiKey: 'dev-api-key-123',
        timeout: '5000'
      }, null, 2)
    );

    await APIClientServiceInstance.CreateEnvironment(
      'Production',
      JSON.stringify({
        baseUrl: 'https://api.production.com',
        apiKey: 'prod-api-key-456',
        timeout: '10000'
      }, null, 2)
    );

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize sample data:', error);
  }
};