# trello-hooks

## TODO

- include tag in travis for trello-hooks

## Deploy

### basic packages
http://therightchoyce.tumblr.com/post/37209565860/installing-nodejs-on-an-ec2-ubuntu-instance-for

sudo apt-get update
sudo apt-get install build-essential
sudo apt-get install libssl-dev
sudo apt-get install lynx
sudo apt-get install nginx

### Code deploy
sudo service codedeploy-agent status
sudo apt-get install python-pip
sudo apt-get install ruby2.0
sudo apt-get install wget
cd /home/ubuntu
wget https://aws-codedeploy-eu-west-1.s3.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent status

### Node
http://aws-labs.com/install-node-js-ubuntu-14-04-server/

// sudo apt-get install nodejs npm
curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | sh
source ~/.profile
nvm ls-remote
nvm install 5.11.0
node --version

