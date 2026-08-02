import axios from "../utils/axiosConfig";
import { CheerioAPI, load as CheerioLoad } from "cheerio";
import DHAKA_STOCK_URLS from "../constants"; 
import { Service } from "typedi";

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

  private getCurrentTradingCodes($: CheerioAPI, tableSelector: string): string[] {
    const headers: string[] = [];
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

    if (headers.length === 0) return data;

    $(tableSelector).find("tr").each((index, element) => {
      if (index === 0 && skipFirstRow) return;

      const tds = $(element).find("td");
      let rowData: T = {} as T;
      
      headers.forEach((header, idx) => {
         // @ts-ignore
         rowData[header] = $(tds[idx]).text().trim().replace(/,/g, "") as any;
      });
      
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

  // 🌟 একদম সঠিক DSE Day End Archive ডেটা ফাংশন
  async getHistData(
    start: string,
    end: string,
    code = "All Instrument"
  ): Promise<any[]> {
    const url = DHAKA_STOCK_URLS.HISTORY_DATA; 
    
    // 🔥 প্যারামিটার ঠিক করে বসানো হয়েছে (আর তারিখ কনভার্ট করার দরকার নেই)
    const params = {
      startDate: start,  // সোজা YYYY-MM-DD 
      endDate: end,      // সোজা YYYY-MM-DD
      inst: code,
      archive: "data",   // DSE এর এই প্যারামিটারটি চায়
    };

    const $ = await this.fetchAndParseHtml(url, params);
    
    return this.parseTableRows<any>($, "table.table-bordered");
  }
}
