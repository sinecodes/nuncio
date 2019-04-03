
import "jasmine";
import { CommandDefinition } from "../definitions";

const alarm = <CommandDefinition>require("../commands/alarm");

var msg = {};

msg["author"]  = {};
msg["guild"]   = {};
msg["channel"] = {};

msg["author"]["id"]  = "test-author-id";
msg["guild"]["id"]   = "test-guild-id";
msg["channel"]["id"] = "test-channelid";

describe("Setting up an alarm", () => {

  const thisArgs  = ["set", "this", "friday", "19.00", "blah", "blah"];
  const nextArgs  = ["set", "next", "friday", "19.00", "blah", "blah"];
  const eachArgs  = ["set", "each", "friday", "19.00", "blah", "blah"];
  const everyArgs = ["set", "every","friday", "19.00", "blah", "blah"];
  const ddmm1Args = ["set", "every","friday", "19.00", "blah", "blah"];
  const ddmm2Args = ["set", "every","friday", "19.00", "blah", "blah"];

  beforeAll( () => {

    spyOn<any>(alarm, "persist").and.returnValue(true);
    spyOn<any>(alarm, "addOffset").and.returnValue([19, 0]);

  });

  it("accepts calls on this week", async() => {

    expect(await alarm.execute(<any>msg, thisArgs)).toEqual("Alarm set");

  })

  it("accepts calls on next week", async() => {

    expect(await alarm.execute(<any>msg, nextArgs)).toEqual("Alarm set");

  })

  it("accepts calls on cyclic 'each' events", async() => {

    expect(await alarm.execute(<any>msg, eachArgs)).toEqual("Alarm set");

  })

  it("accepts calls on cyclic 'every' events", async() => {

    expect(await alarm.execute(<any>msg, everyArgs)).toEqual("Alarm set");

  })

  it("accepts calls on DD-MM events", async() => {

    expect(await alarm.execute(<any>msg, ddmm1Args)).toEqual("Alarm set");

  })

  it("accepts calls on DD/MM events", async() => {

    expect(await alarm.execute(<any>msg, ddmm2Args)).toEqual("Alarm set");

  })


});

