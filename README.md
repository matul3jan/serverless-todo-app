## Serverless Todo app

### Architecture

<img width="885" alt="image" src="https://user-images.githubusercontent.com/26350749/203406550-1ca7407e-fbb2-460b-a414-2cdf89e9ac9f.png">

### Install Serverless

```
npm install -g serverless
```

### Initial Setup

[Configure aws credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/)

Pass role under provider in serverless.yml

```
provider:
  iam:
    role: YOUR_ROLE_ARN_HERE
```

### Deploy

```
serverless deploy
```

### Destroy

```
serverless remove
```
