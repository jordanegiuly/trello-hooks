cd /var/www/app/
echo which node
echo node --version
echo npm --version
forever stopall
forever start -c /home/ubuntu/.nvm/v5.11.0/bin/node app/index.js
