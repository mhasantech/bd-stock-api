import axios from "../utils/axiosConfig";
import { CheerioAPI, load as CheerioLoad } from "cheerio";
import DHAKA_STOCK_URLS from "../constants"; 
import { Service } from "typedi";

// YYYY-MM-DD থেকে DD-MM-YYYY ফরম্যাটে পরিবর্তন ফাংশন
function convertDateFormat(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

@Service()
export class StockDataService {
  private async fetchAndParseHtml(
    url: string,
    params: any = {}
  ): Promise<CheerioAPI> {
    try {
      const response = await axios.get(url, { params });
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: Status Code ${response.status}`);
      }
      return CheerioLoad(response.data);
    } catch (error) {
      console.error("Error in fetchAndParseHtml:", error);
      throw error;
    }
  }

  // হেডার বের করার একটি সুরক্ষিত ফাংশন
  private getCurrentTradingCodes($: CheerioAPI, tableSelector: string): string[] {
    const headers: string[] = [];
    // ডেটা টেবিলের প্রথম সারি থেকে হেডার (th বা td) বের করা
    const firstRow = $(tableSelector).first().find("tr").first();
    firstRow.find("th, td").each((_, el) => {
        headers.push($(el).text().trim());
    });
    return headers;
  }

  async parseTableRows<T extends Record<string, any>>(
    $: CheerioAPI,
    tableSelector: string,
    skipFirstRow: boolean = true
  ): Promise<T[]> {
    const headers = this.getCurrentTradingCodes($, tableSelector);
    const data: T[] = [];

    // (Advanced) যদি হেডার না পাওয়া যায়, তবে ফাঁকা ডেটা ফেরত দেবে না
    if (headers.length === 0) return data;

    $(tableSelector).find("tr").each((index, element) => {
      // প্রথম সারি (হেডার রো) স্কিপ করা
      if (index === 0 && skipFirstRow) return;

      const tds = $(element).find("td");
      let rowData: T = {} as T;
      
      headers.forEach((header, idx) => {
         // @ts-ignore
         rowData[header] = $(tds[idx]).text().trim().replace(/,/g, "") as any;
      });
      
      // যেকোনো ফাঁকা ডেটা এড়িয়ে যাওয়া
      if (Object.values(rowData).some(val => val !== "" && val !== undefined)) {
          data.push(rowData);
      }
    });

    return data;
  }

  async getStockData(): Promise<any[]> {
    const url = DHAKA_STOCK_URLS.LATEST_STOCK;
    const $ = await this.fetchAndParseHtml(url);
    return this.parseTableRows<any>($, "table.table-bordered");
  }

  async getDsexData(symbol: string | undefined): Promise<any[]> {
    const url = DHAKA_STOCK_URLS.DSEX_DATA;
    try {
      const $ = await this.fetchAndParseHtml(url);
      let data = await this.parseTableRows<any>($, "table.table-bordered");
      if (symbol) {
        data = data.filter(
          (d) =>
            d["TRADING CODE"] && d["TRADING CODE"].toUpperCase() === symbol.toUpperCase()
        );
      }
      return data;
    } catch (error) {
      console.error("Error fetching DSEX data:", error);
      return [];
    }
  }

  async getTop30(): Promise<any[]> {
    const url = DHAKA_STOCK_URLS.TOP_30;
    try {
      const $ = await this.fetchAndParseHtml(url);
      let data = await this.parseTableRows<any>($, "table.table-bordered");
      return data;
    } catch (error) {
      console.error("Error fetching DSEX data:", error);
      return [];
    }
  }

  // 🔥 আপডেট করা আর্কাইভ ডেটা ফাংশন (table.table-bordered টার্গেট করা হয়েছে)
  async getHistData(
    start: string,
    end: string,
    code = "All Instrument"
  ): Promise<any[]> {
    const url = DHAKA_STOCK_URLS.HISTORY_DATA; // data_archive.php
    
    const params = {
      startdate: convertDateFormat(start), 
      enddate: convertDateFormat(end),
      inst: code,
    };

    const fullUrl = `${url}?${new URLSearchParams(params).toString()}`;

    const $ = await this.fetchAndParseHtml(fullUrl);
    
    // 🔑 সঠিক টেবিল সিলেক্টর: table.table-bordered
    return this.parseTableRows<any>($, "table.table-bordered");
  }
}
