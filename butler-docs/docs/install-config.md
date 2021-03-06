# Requirements

Butler depends on various pieces of software. Some are required, others are optional, as described below.

| What | Comment |  
| ---- | ------- |  
| Sense Enterprise | Butler is developed with Sense Enterprise in mind. While many Butler features might also work with Sense Desktop, you are on your own there. |  
| MQTT broker | MQTT is used for both in- and out-bound pub-sub messaging. Butler assumes a working MQTT broker is available, the IP of which is defined in the Butler config file. Mosquitto is a nice open source broker. It requires very little hardware to run, even the smallest (free!) Amazon EC2 instance is enough, if you want a dedicated MQTT server. If you don't care about the pubsub features of Butler, you obviously don't need a MQTT broker. | 
| node.js | Butler is written in Node - which is thus a firm requirement. |   
 


## Windows or OSX
While Sense is a Windows only system, Butler should be able to run on any OS where node.js is available.  
Butler has been succesfully used - both during development and production use - on Windows, Linux (Debian and Ubuntu tested) and OSX.


# Installation

Below are the general steps needed to install Butler. Please note that you might need to adapt these to your particular system configuration.   

* **Install node.js**  
  Butler has been developed and tested using the 64 bit version of [node.js](https://nodejs.org/en/download/) 4.4.6.   

* **Decide where to install Butler**  
  It is usually a good starting point to run Butler on the Sense server. If there are more than one server in the Sense cluster, Butler can be placed on the reload server (as the /createDir endpoint then can be used to create folders in which QVD and other files can be stored).
  That said, it is quite possible to run Butler on any server, as long as there is network connectivity to the Sense server(s).  

* **Download Butler**  
  Download the repository zip file or clone the Butler repository using your git tool of choice. Both options achieve the same thing, i.e. a directory such as d:\node\butler, which is then Butler's root directory.  

* **Install node dependencies**  
  From a Windows command prompt (assuming Butler was installed to d:\\node\\butler):  

        d:
        cd \node\butler\src
        npm install  

    This will download and install all node.js modules used by Butler.  

* **MQTT message broker**  
Many of Butler's features use [MQTT](http://mqtt.org/) for sending and receiving messages.  
MQTT is a standardised messaging protocol, and it should be possible to use [any broker following the MQTT standard](https://github.com/mqtt/mqtt.github.io/wiki/software?id=software).    
Butler has been developed and tested using [Mosquitto](https://mosquitto.org/) running on OSX and Debian Linux - both work flawlessly.

* **Documentation dependencies**  
  If you plan to modify or extend Butler's documentation, you will need to install [MkDocs](http://www.mkdocs.org/).  
  MkDocs is used to create the pages you are reading right now.


# Security considerations

* You should make sure to configure the firewall of the server where Buter is running, so it only accepts connections from the desired clients/IP addresses.
A reasonable first approach would be to configure the firewall to only allow calls from localhost. That way calls to Butler can only be made from the server where Butler itself is running.
 
* As of right now the MQTT connections are not secured by certificates or passwords.
For use within a controlled network that might be fine, but nonetheless something to keep in mind. Adding certificate based authentication (which MQTT supports) would solve this.  

* Butler uses various node.js modules from [npm](https://www.npmjs.com/). If concerned about security, you should review these dependencies and decide whether there are issues in them or not.  
Same thing with Butler itself - while efforts have been made to make Butler secure, you need to decide for yourself whether the level of security is enough for your use case.  
    
Butler is continuously checked for security vulnerabilities by using [Snyk](https://snyk.io/), with status badges shown in the readme files.


# Configuration

Butler uses configuration files in YAML format. The config files are stored in the src\\config folder. Prior to v2.1 JSON config files were used, but as YAML is much more human readable than JSON, a switch was made. JSON config files can still be used, but YAML is the default starting with v2.1.

Butler comes with a default config file called `default_template.yaml`. Make a copy of it, then rename the copy to `default.yaml` or `production.yaml`.  
Update it as needed (see below for details).

Trying to run Butler with the default config file (the one included in the files download from GitHub) will not work - you need to adapt it to your server environment.

Note: Butler uses the [node-config](https://github.com/lorenwest/node-config) module to handle config files. As per node-config's documentation, to switch to using the production.yaml config file, at a command prompt type (for Windows)

    set NODE_ENV=production

  before starting Butler with `node butler.js`.  
  If developing on OSX or Linux, instead use  

    export NODE_ENV=production

You may want to set that variable during server boot, to ensure Butler starts properly when the server is rebooted.


## Config file syntax

The `default_template.yaml` config file looks like this:

```yml
---
Butler:
  slackConfig:
    webhookURL: <fill in your web hook URL from Slack>
    loginNotificationChannel: sense-user-activity
    taskFailureChannel: sense-task-failure
  mqttConfig:
    brokerHost: <FQDN or IP of MQTT server>
    brokerPort: 1883
    taskFailureTopic: qliksense/task_failure
    taskFailureServerStatusTopic: qliksense/butler/task_failure_server
    sessionStartTopic: qliksense/session/start
    sessionStopTopic: qliksense/session/stop
    connectionOpenTopic: qliksense/connection/open
    connectionCloseTopic: qliksense/connection/close
    sessionServerStatusTopic: qliksense/butler/session_server
    activeUserCountTopic: qliksense/users/active/count
    activeUsersTopic: qliksense/users/active/usernames
  udpServerConfig:
    serverIP: <FQDN or IP of server where Butler is running>
    portSessionConnectionEvents: 9997
    portTaskFailure: 9998
  restServerConfig:
    serverPort: 8080
  configEngine:
    engineVersion: 12.20.0        # Qlik Associative Engine version to use with Enigma.js
    server: <FQDN or IP of Sense server where Sense Engine is running>
    serverPort: '<Port to connect to, usually 4747>'
    isSecure: 'true'
    headers:
      X-Qlik-User: UserDirectory=Internal;UserId=sa_repository
    cert: <Path to cert file>
    key: <Path to key file>
    rejectUnauthorized: 'false'
  configQRS:
    authentication: certificates
    host: <FQDN or IP of Sense server where QRS is running>
    useSSL: true
    port: 4242
    headerKey: X-Qlik-User
    headerValue: UserDirectory=Internal; UserId=sa_repository
    cert: <Path to client.pem>
    key: <Path to client_key.pem>
    ca: <Path to root.pem>
  qvdPath: <Path to folder under which QVDs are stored>
  gitHub:
    host: api.github.com
    pathPrefix: ''
```

Comments:

* Currently Butler assumes that a MQTT broker is present, and that status messages should be sent to Slack. Butler will fail with error messages if it cannot connect to a MQTT server, or if the Slack Webhook URL is not properly set.  
Future versions may make MQTT, Slack and other similar channels optional, using the config file.  

* The default location cert/key files are found in (assuming a standard install of Qlik Sense) C:\ProgramData\Qlik\Sense\Repository\Exported Certificates\.Local Certificates  
The files to use are `client.pem` and `client_key.pem`. The config file can point straight to these files.  
Or export a new client cert/keys from the QMC and use these with Butler.


# log4net extender config files
Butler includes a couple of xml files that when deployed to the Sense server will create real-time UDP messages for certain events (tasks failing, user sessions starting/ending etc).  
These xml files should be deployed as follows:  
  
* Task failure events  
    * XML file found in log4net_task-failed/LocalLogConfig.xml. This file includes settings to both send an email, and a UDP message when a task fails.
    * XML file should be deployed to the server where reloads are done, in the C:\ProgramData\Qlik\Sense\Scheduler directory
* User audit events
    * XML file found in log4net_user-audit-event/LocalLogConfig.xml
    * XML file should be deployed on the server where the proxy is running, in the C:\ProgramData\Qlik\Sense\Proxy directory
    * If there multiple proxies on different servers, it might make sense deploying the xml file on all of them, to capture all user audit events.


# Customisation
As Butler offers a rather diverse set of features, everyone might not need all features. There is no single config file in which individual features can be turned on/off, 
but given the structure of the Butler source code it is relatively easy to disable speciifc features, or add new ones.  
For example, to disable a particular REST API endpoint, you could just remove the registration of that endpoint from within the src/butler.js file.