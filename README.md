# SheffieldJS - Distributed Server Framework

SheffieldJS is a distributed server framework. It is built around the idea that requests can be offloaded to any server in the cluster and that the cluster can scale horizontally.


## Security By Default

The framework uses a hash-fingerprinting mechanism on requests. When an instance of SheffieldJS is started, it generates a unique 512-bit hash, andattempts to contact all servers listed in the cluster informing them of it's server ID. If this request is successful, it is then active within the cluster.

In order for this request to succeed, the sender must first send the shared key, and the request must originate from an IP specified as being part of the cluster.

The recipient of this request will compare whether the shared key matches with the one submitted by the sender. If these values match, the recipient will then respond with it's server ID.


## What if I just want to run a single instance?

You can do that with SheffieldJS, but the project is aimed at providing redundancy options.


## What if I only have a single VM or physical server?

You can run multiple instances of SheffieldJS on a single VM or physical server - just change the port number in application.config!

## Here be dragons! (AKA - Early Software)

This software is currently in the very early stages.