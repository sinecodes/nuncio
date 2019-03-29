
import "jasmine";
import * from "discord.js";

const alarm = require("../commands/alarm");

var a = new Message();


describe("description", () => {

  const args = ["this", "friday", "19.00", "blah", "blah"]


  spyOn(alarm, "persist").and.returnValue(true);

  it("should work", () => {

    


  
  })
});

