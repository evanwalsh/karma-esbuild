import { Config } from "pentf/config";
import { runKarma } from "./test-utils";
import { assertEventually } from "pentf/assert_utils";

export const description = "Run a single test with a bundle";
export async function run(config: Config) {
	const { output } = await runKarma(config, "one-bundle");

	await assertEventually(() => {
		return output.stdout.find(line => /should work/.test(line));
	});
	await assertEventually(() => {
		return output.stdout.find(line => /2 tests completed/.test(line));
	});
}
