import {
	AlwaysDepth,
	EqualDepth,
	GreaterDepth,
	GreaterEqualDepth,
	LessDepth,
	LessEqualDepth,
	NeverDepth,
	NoBlending,
	NotEqualDepth,
	ShaderMaterial,
	Uniform
} from "three";

import fragmentShader from "./glsl/depth-mask/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * An enumeration of depth test strategies.
 *
 * @type {Object}
 * @property {Number} DEFAULT - Perform depth test only.
 * @property {Number} KEEP_MAX_DEPTH - Always keep max depth.
 * @property {Number} DISCARD_MAX_DEPTH - Always discard max depth.
 */

export const DepthTestStrategy = {
	DEFAULT: 0,
	KEEP_MAX_DEPTH: 1,
	DISCARD_MAX_DEPTH: 2
};

/**
 * A depth mask shader material.
 *
 * This material masks a color buffer by comparing two depth textures.
 */

export class DepthMaskMaterial extends ShaderMaterial {

	/**
	 * Constructs a new depth mask material.
	 */

	constructor() {

		super({
			name: "DepthMaskMaterial",
			defines: {
				DEPTH_EPSILON: "0.00001",
				DEPTH_PACKING_0: "0",
				DEPTH_PACKING_1: "0",
				DEPTH_TEST_STRATEGY: DepthTestStrategy.KEEP_MAX_DEPTH
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer0: new Uniform(null),
				depthBuffer1: new Uniform(null)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		/**
		 * The current depth mode.
		 *
		 * @type {DepthModes}
		 * @private
		 */

		this.depthMode = LessDepth;
		this.setDepthMode(LessDepth);

	}

	/**
	 * Indicates whether maximum depth values should be preserved.
	 *
	 * @type {Boolean}
	 * @deprecated Use getMaxDepthStrategy() instead.
	 */

	get keepFar() {

		return (this.getMaxDepthStrategy() === DepthTestStrategy.KEEP);

	}

	/**
	 * Controls whether maximum depth values should be preserved.
	 *
	 * @type {Boolean}
	 * @deprecated Use setMaxDepthStrategy(DepthTestStrategy.KEEP_MAX_DEPTH) instead.
	 */

	set keepFar(value) {

		this.setMaxDepthStrategy(value ? DepthTestStrategy.KEEP_MAX_DEPTH : DepthTestStrategy.DISCARD_MAX_DEPTH);

	}

	/**
	 * Returns the strategy for dealing with maximum depth values.
	 *
	 * @return {DepthTestStrategy} The strategy.
	 */

	getMaxDepthStrategy() {

		return Number(this.defines.DEPTH_TEST_STRATEGY);

	}

	/**
	 * Sets the strategy for dealing with maximum depth values.
	 *
	 * @param {DepthTestStrategy} value - The strategy.
	 */

	setMaxDepthStrategy(value) {

		this.defines.DEPTH_TEST_STRATEGY = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Returns the current error threshold for depth comparisons. Default is `1e-5`.
	 *
	 * This value is only used for `EqualDepth` and `NotEqualDepth`.
	 *
	 * @return {Number} The error threshold.
	 */

	getEpsilon() {

		return Number(this.defines.DEPTH_EPSILON);

	}

	/**
	 * Sets the depth comparison error threshold.
	 *
	 * This value is only used for `EqualDepth` and `NotEqualDepth`.
	 *
	 * @param {Number} value - The new error threshold.
	 */

	setEpsilon(value) {

		this.defines.DEPTH_EPSILON = value.toFixed(16);
		this.needsUpdate = true;

	}

	/**
	 * Returns the current depth mode.
	 *
	 * @return {DepthModes} The depth mode. Default is `LessDepth`.
	 */

	getDepthMode() {

		return this.depthMode;

	}

	/**
	 * Sets the depth mode.
	 *
	 * @see https://threejs.org/docs/#api/en/constants/Materials
	 * @param {DepthModes} mode - The depth mode.
	 */

	setDepthMode(mode) {

		// If the depth test fails, the texel will be discarded.
		let depthTest;

		switch(mode) {

			case NeverDepth:
				depthTest = "false";
				break;

			case AlwaysDepth:
				depthTest = "true";
				break;

			case EqualDepth:
				depthTest = "abs(d1 - d0) <= DEPTH_EPSILON";
				break;

			case NotEqualDepth:
				depthTest = "abs(d1 - d0) > DEPTH_EPSILON";
				break;

			case LessDepth:
				depthTest = "d0 > d1";
				break;

			case LessEqualDepth:
				depthTest = "d0 >= d1";
				break;

			case GreaterEqualDepth:
				depthTest = "d0 <= d1";
				break;

			case GreaterDepth:
			default:
				depthTest = "d0 < d1";
				break;

		}

		this.depthMode = mode;
		this.defines["depthTest(d0, d1)"] = depthTest;
		this.needsUpdate = true;

	}

}
