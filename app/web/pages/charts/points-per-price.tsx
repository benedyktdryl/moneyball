import React, { PureComponent } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { flatten } from "lodash";

import { Player, RankedPlayer } from "../../../types";

import dataAll from "../../../../data/data-all.json";

const data = dataAll.overallData;

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    /* tslint:disable no-console */
    console.log(payload);
    const [
      {
        payload: { name, team },
      },
    ] = payload;

    return (
      <div className="custom-tooltip">
        <p className="label">{`Name : ${name}`}</p>
        <p className="label">{`Team : ${team}`}</p>
      </div>
    );
  }

  return null;
};

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
        <XAxis type="number" dataKey="points" name="points" unit="point" />
        <YAxis type="number" dataKey="price" name="price" unit="price" />
        <Tooltip content={<CustomTooltip />} />
        <Scatter name="Points per round" data={data} fill="#8884d8" />
      </ScatterChart>
    );
  }
}
