cd /var/www/app/
forever stopall
NODE_ENV=production forever start -c /home/ubuntu/.nvm/v5.11.0/bin/node app/index.js
