FROM node:18.15.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the remaining application files to the working directory
COPY . .

# Expose the port that your application listens on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]