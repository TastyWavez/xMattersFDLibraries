/*

                        ___            ___
                        /   \          /   \
                        \_   \        /  __/
                        _\   \      /  /__
                        \___  \____/   __/
                            \_       _/
                            | @ @  \_
                            |
                            _/     /\
                            /o)  (o/\ \_
                HELLO!>    \_____/ /
                            \____/

This is a shared library for use in both IB and FD that simplifies REST calls.
The library includes built-in retry logic as well as error handling. 
Supports all 5 REST Methods (CRUD): PUT, PATCH, POST, GET, DELETE

Example GET: 

const xmutils = require("xmutils");

const path = '/api/xm/1/people';
const headers = {
            "Content-Type": "application/json",
          };

const people = xmutils.get("xMatters", path, headers);

*/

// log prefix
var sharedLibraryName = "[xmutils] ";

exports.patch = function(jsonStr, endpoint, path, headers) {
  return execute('PATCH', jsonStr, endpoint, path, headers);
};

exports.post = function (jsonStr, endpoint, path, headers) {
  return execute("POST", jsonStr, endpoint, path, headers);
};
exports.put = function (jsonStr, endpoint, path, headers) {
  return execute("PUT", jsonStr, endpoint, path, headers);
};
exports.get = function (endpoint, path, headers) {
  return execute("GET", null, endpoint, path, headers);
};

exports.delete = function (endpoint, path, headers) {
  return execute("DELETE", null, endpoint, path, headers);
};

exports.statusCodeSuccess = function (statusCode) {
  return statusCode >= 200 && statusCode <= 299;
};

function execute(method, jsonStr, endpoint, path, headers) {
  // Maximum number of retries for timeouts and unexpected exceptions
  MAX_RETRY = 3;

  var xLoggerPrefix = sharedLibraryName + "execute: ";

  var retry = 0;
  var response;

  console.log("About to start requests");
  // if the request fails due to an exception, retry the request
  while (retry < MAX_RETRY) {
    console.log("Attempt number " + (retry+1));
    try {
      var request = {
        endpoint: endpoint,
        method: method,
        path: path,
      };

      if (headers === undefined) {
        if (method !== "GET") {
          request.headers = {
            "Content-Type": "application/json",
          };
        }
      } else {
        request.headers = headers;
      }

      var req = http.request(request);
      response = method !== "GET" ? req.write(jsonStr) : req.write();
      
      if (statusCodeSuccess(response.statusCode)) {
          retry = MAX_RETRY;
      }else{
          console.log(xLoggerPrefix + " Unexepected Exception: " + response.statusCode);
          response = null;
          retry++;
      }
       // succeed
    } catch (e) {
      console.log(xLoggerPrefix + " Unexepected Exception: " + e);
      response = null;
      retry++;
    }
  }

  return response;
}

exports.initiate = function (data, endpoint, path) {
  var xLoggerPrefix = sharedLibraryName + "initiate: ";
  var headers = {
    "Content-Type": "application/json",
  };

  var response = post(data, endpoint, path, headers);
  try {
    if (statusCodeSuccess(response.statusCode)) {
      json = JSON.parse(response.body);
      console.log(xLoggerPrefix + " " + JSON.stringify(json));
    } else {
      json = null;
    }
  } catch (e) {
    console.log(xLoggerPrefix + "Unexpected exception: " + e);
    json = null;
  }
  return json;
};

function statusCodeSuccess(statusCode) {
  return statusCode >= 200 && statusCode <= 299;
}

function post(jsonStr, endpoint, path, headers) {
  return execute("POST", jsonStr, endpoint, path, headers);
} // log prefix
