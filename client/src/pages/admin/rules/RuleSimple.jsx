import React, { useState } from "react";
import MatchdaySelect from "../../../components/admin/MatchdaySelect.jsx";

const RuleSimple = ({ matchdays, formValues, setFormValues }) => {
  return (
    <div className="space-y-6">
      <MatchdaySelect
        matchdays={matchdays}
        value={formValues.matchday}
        onChange={(val) => setFormValues({ ...formValues, matchday: val })}
      />
    </div>
  );
};

export default RuleSimple;
