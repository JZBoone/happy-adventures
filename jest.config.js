const { JSDOM } = require("jsdom");
const canvas = require("canvas");

const url = "http://localhost:3000"; // This can be any URL

const jsdom = new JSDOM("<!doctype html><html><body></body></html>", { url });
const { window } = jsdom;

function copyProps(src) {
  const props = Object.getOwnPropertyDescriptors(src);
  for (let prop in props) {
    if (typeof global[prop] === "undefined") {
      Object.defineProperty(global, prop, props[prop]);
    }
  }
}

global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;
global.HTMLCanvasElement = canvas.HTMLCanvasElement;

copyProps(window, global);

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
};
