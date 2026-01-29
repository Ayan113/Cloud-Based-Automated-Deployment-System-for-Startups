# AWS Deployment Setup Guide

Complete guide for deploying the MERN stack application to AWS EC2.

## Prerequisites

- AWS Account with billing enabled
- Basic knowledge of AWS EC2 and SSH
- GitHub repository access

---

## Step 1: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Enter username: `github-actions-deploy`
4. Select **Attach policies directly**:
   - `AmazonEC2FullAccess` (or create a minimal policy)
5. Click **Create user** → **Security credentials** → **Create access key**
6. Select **Application running outside AWS** → **Create access key**
7. **Save both keys** securely - you'll need them for GitHub Secrets

---

## Step 2: Launch EC2 Instance

1. Go to [EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch Instance**
3. Configure:
   - **Name**: `mern-deploy-production`
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04
   - **Instance type**: `t3.micro` (free tier) or `t3.small`
   - **Key pair**: Create new → Download `.pem` file
   - **Security Group**: Create new with these rules:

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | My IP |
| HTTP | 80 | Anywhere (0.0.0.0/0) |
| HTTPS | 443 | Anywhere (0.0.0.0/0) |

4. Click **Launch Instance**
5. Note the **Public IPv4 address** or **Public DNS**

---

## Step 3: Setup EC2 Instance

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Download and run the setup script
curl -O https://raw.githubusercontent.com/Ayan113/Cloud-Based-Automated-Deployment-System-for-Startups/main/deploy/aws-setup.sh
chmod +x aws-setup.sh
./aws-setup.sh

# Log out and back in for Docker permissions
exit
ssh -i your-key.pem ec2-user@your-ec2-ip

# Copy production files
cd /opt/mern-deploy
curl -O https://raw.githubusercontent.com/Ayan113/Cloud-Based-Automated-Deployment-System-for-Startups/main/docker-compose.prod.yml
mkdir -p deploy
curl -o deploy/nginx.conf https://raw.githubusercontent.com/Ayan113/Cloud-Based-Automated-Deployment-System-for-Startups/main/deploy/nginx.conf
```

---

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

2. Add these **Secrets** (click "New repository secret"):

| Secret Name | Value |
|------------|-------|
| `AWS_ACCESS_KEY_ID` | Your IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key |
| `EC2_HOST` | EC2 public IP or DNS |
| `EC2_SSH_KEY` | Contents of your `.pem` file |
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGIN` | `https://your-domain.com` |

3. Add these **Variables** (under Variables tab):

| Variable Name | Value |
|--------------|-------|
| `AWS_DEPLOYMENT_ENABLED` | `true` |

---

## Step 5: Create Production Environment

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name: `production`
4. (Optional) Add protection rules like required reviewers

---

## Step 6: Trigger Deployment

Push to the `main` branch to trigger the CI/CD pipeline:

```bash
git add .
git commit -m "Enable AWS deployment"
git push origin main
```

Monitor the deployment at: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

---

## Verification

After deployment completes:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Check containers
docker ps

# Check health
curl http://localhost/api/health
```

Access your app at: `http://your-ec2-ip`

---

## Troubleshooting

**Deployment fails at "Configure AWS Credentials"**
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Ensure IAM user has required permissions

**SSH connection fails**
- Check `EC2_SSH_KEY` contains the complete `.pem` file contents
- Verify EC2 security group allows port 22 from GitHub IPs

**Containers not starting**
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs

# Check .env file
cat /opt/mern-deploy/.env
```
