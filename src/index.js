"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require("express");
const puppeteer = __importStar(require("puppeteer"));
//autobunny dealership
// const DEALERSHIP_URL = "https://www.khushiauto.ca/used-cars";
const DEALERSHIP_URL = "https://www.kmsfinecars.com/used-cars/";
const initialisePuppeteer = () => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch({
        headless: false,
    });
    const page = yield browser.newPage();
    yield page.goto(DEALERSHIP_URL, { timeout: 0 });
    // #main > div > div:nth-child(2) > div > div > div > div:nth-child(3)
    //#main > div > div:nth-child(2) > div > div > div > div:nth-child(12)
    //btn btn-inventory-details btn-default btn-block
    //#main > div > div:nth-child(2) > div > div > div > div:nth-child(4) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block
    // await page.waitForSelector('a[href="https://www.khushiauto.ca/used-cars"]');
    const hrefs = [];
    for (let i = 3; i <= 12; i++) {
        let element = yield page.$$eval(`#main > div > div:nth-child(2) > div > div > div > div:nth-child(${i}) > div > div.col-sm-9.col-md-9 > div > div.col-sm-3.col-md-3 > span.vehiclePrice > span > a.btn.btn-inventory-details.btn-default.btn-block`, (element) => element.map((el) => el.getAttribute("href")));
        hrefs.push(element);
    }
    console.log(hrefs);
    // let value = await page.evaluate(el => el.textContent, element)
    // console.log(value);
});
initialisePuppeteer();
