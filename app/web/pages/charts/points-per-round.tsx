import React, { PureComponent } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { flatten } from "lodash";

import { Player, RankedPlayer } from "../../../types";

import dataAll from "../../../../data/data-all.json";

const data = flatten(
  dataAll.all.map((round: Player[], index) => {
    return round.map((item) => ({
      x: index + 1,
      y: item.points,
    }));
  })
);

/* tslint:disable no-console */
console.log(data);

export default class Example extends PureComponent {
  render() {
    return (
      <ScatterChart
        width={900}
        height={900}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="rounds" unit="round" />
        <YAxis type="number" dataKey="y" name="points" unit="point" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Points per round" data={data} fill="#8884d8" />
      </ScatterChart>
    );
  }
}
