import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, set, get, remove, onValue, push } from "firebase/database";

export default function CRUD() {
  const [buses, setBuses] = useState({});
  const [routes, setRoutes] = useState({});

  // form states
  const [busForm, setBusForm] = useState({
    busId: "",
    routeId: "",
    lat: "",
    lon: "",
    passengers: ""
  });

  const [routeForm, setRouteForm] = useState({
    routeId: "",
    name: "",
    stops: ""
  });

  // Realtime load data
  useEffect(() => {
    const busesRef = ref(db, "buses");
    const routesRef = ref(db, "routes");
    onValue(busesRef, (snap) => setBuses(snap.val() || {}));
    onValue(routesRef, (snap) => setRoutes(snap.val() || {}));
  }, []);

  // Add/Update Bus
  const saveBus = async () => {
    if (!busForm.busId) return alert("Enter Bus ID");
    const busRef = ref(db, `buses/${busForm.busId}`);
    await set(busRef, {
      busId: busForm.busId,
      routeId: busForm.routeId,
      lat: parseFloat(busForm.lat),
      lon: parseFloat(busForm.lon),
      passengers: parseInt(busForm.passengers) || 0
    });
    alert("Bus saved!");
    setBusForm({ busId: "", routeId: "", lat: "", lon: "", passengers: "" });
  };

  const deleteBus = async (id) => {
    if (window.confirm("Delete this bus?")) {
      await remove(ref(db, `buses/${id}`));
    }
  };

  // Add/Update Route
  const saveRoute = async () => {
    if (!routeForm.routeId) return alert("Enter Route ID");
    let stopsArr = [];
    try {
      stopsArr = JSON.parse(routeForm.stops);
    } catch (e) {
      alert('Invalid stops JSON (example: [{"lat":6.05,"lon":80.22}])');
      return;
    }
    const routeRef = ref(db, `routes/${routeForm.routeId}`);
    await set(routeRef, {
      name: routeForm.name,
      stops: stopsArr
    });
    alert("Route saved!");
    setRouteForm({ routeId: "", name: "", stops: "" });
  };

  const deleteRoute = async (id) => {
    if (window.confirm("Delete this route?")) {
      await remove(ref(db, `routes/${id}`));
    }
  };

  return (
    <div className="min-h-screen bg-black p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center text-indigo-700">
        RideLink Firebase CRUD Manager
      </h1>

      {/* ---------- BUS CRUD ---------- */}
      <section className="bg-black p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-indigo-600">
          🚌 Manage Buses
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Bus ID"
            className="border p-2 rounded"
            value={busForm.busId}
            onChange={(e) => setBusForm({ ...busForm, busId: e.target.value })}
          />
          <input
            placeholder="Route ID"
            className="border p-2 rounded"
            value={busForm.routeId}
            onChange={(e) =>
              setBusForm({ ...busForm, routeId: e.target.value })
            }
          />
          <input
            placeholder="Latitude"
            className="border p-2 rounded"
            value={busForm.lat}
            onChange={(e) => setBusForm({ ...busForm, lat: e.target.value })}
          />
          <input
            placeholder="Longitude"
            className="border p-2 rounded"
            value={busForm.lon}
            onChange={(e) => setBusForm({ ...busForm, lon: e.target.value })}
          />
          <input
            placeholder="Passengers"
            className="border p-2 rounded"
            value={busForm.passengers}
            onChange={(e) =>
              setBusForm({ ...busForm, passengers: e.target.value })
            }
          />
        </div>
        <div className="mt-4">
          <button
            onClick={saveBus}
            className="bg-indigo-600 text-white px-4 py-2 rounded mr-2"
          >
            Save Bus
          </button>
          <button
            onClick={() =>
              setBusForm({
                busId: "",
                routeId: "",
                lat: "",
                lon: "",
                passengers: ""
              })
            }
            className="border px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Existing Buses</h3>
          <table className="w-full text-sm border">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-1">Bus ID</th>
                <th className="border p-1">Route</th>
                <th className="border p-1">Lat</th>
                <th className="border p-1">Lon</th>
                <th className="border p-1">Pass</th>
                <th className="border p-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(buses).map((b) => (
                <tr key={b.busId}>
                  <td className="border p-1">{b.busId}</td>
                  <td className="border p-1">{b.routeId}</td>
                  <td className="border p-1">{b.lat}</td>
                  <td className="border p-1">{b.lon}</td>
                  <td className="border p-1">{b.passengers}</td>
                  <td className="border p-1">
                    <button
                      className="text-red-600"
                      onClick={() => deleteBus(b.busId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- ROUTE CRUD ---------- */}
      <section className="bg-black p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-indigo-600">
          🗺️ Manage Routes
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Route ID"
            className="border p-2 rounded"
            value={routeForm.routeId}
            onChange={(e) =>
              setRouteForm({ ...routeForm, routeId: e.target.value })
            }
          />
          <input
            placeholder="Route Name"
            className="border p-2 rounded"
            value={routeForm.name}
            onChange={(e) =>
              setRouteForm({ ...routeForm, name: e.target.value })
            }
          />
        </div>
        <textarea
          placeholder='Stops JSON e.g. [{"lat":6.05,"lon":80.22},{"lat":6.06,"lon":80.24}]'
          className="border p-2 rounded w-full mt-3 h-24"
          value={routeForm.stops}
          onChange={(e) =>
            setRouteForm({ ...routeForm, stops: e.target.value })
          }
        />
        <div className="mt-3">
          <button
            onClick={saveRoute}
            className="bg-indigo-600 text-white px-4 py-2 rounded mr-2"
          >
            Save Route
          </button>
          <button
            onClick={() => setRouteForm({ routeId: "", name: "", stops: "" })}
            className="border px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Existing Routes</h3>
          <table className="w-full text-sm border">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-1">Route ID</th>
                <th className="border p-1">Name</th>
                <th className="border p-1">Stops</th>
                <th className="border p-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(routes).map(([id, r]) => (
                <tr key={id}>
                  <td className="border p-1">{id}</td>
                  <td className="border p-1">{r.name}</td>
                  <td className="border p-1 text-xs">
                    {r.stops?.length} stops
                  </td>
                  <td className="border p-1">
                    <button
                      className="text-red-600"
                      onClick={() => deleteRoute(id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
