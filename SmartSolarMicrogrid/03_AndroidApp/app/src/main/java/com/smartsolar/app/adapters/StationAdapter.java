package com.smartsolar.app.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.smartsolar.app.R;
import com.smartsolar.app.models.Station;

import java.util.List;

public class StationAdapter extends RecyclerView.Adapter<StationAdapter.ViewHolder> {

    private final Context context;
    private final List<Station> stations;
    private final OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(Station station);
    }

    public StationAdapter(Context context, List<Station> stations, OnItemClickListener listener) {
        this.context = context;
        this.stations = stations;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_station, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Station s = stations.get(position);

        holder.tvStationCode.setText(s.getStationCode());
        holder.tvStationName.setText(s.getName());
        holder.tvLocation.setText(s.getLocationDescription());
        holder.tvCapacity.setText(s.getCapacityKWh() + " kWh Capacity");
        holder.tvBatterySlots.setText(s.getAvailableBatterySlots() + " / " + s.getTotalBatterySlots() + " slots free");
        holder.tvRate.setText("Buy: Rs. " + s.getUnitRateBuy() + " / Sell: Rs. " + s.getUnitRateSell());

        if (s.getDistanceKm() != null) {
            holder.tvDistance.setVisibility(View.VISIBLE);
            holder.tvDistance.setText(String.format("%.1f km away", s.getDistanceKm()));
        } else {
            holder.tvDistance.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(s);
            }
        });
    }

    @Override
    public int getItemCount() {
        return stations.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvStationCode, tvStationName, tvLocation, tvCapacity, tvBatterySlots, tvRate, tvDistance;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvStationCode = itemView.findViewById(R.id.tvStationCode);
            tvStationName = itemView.findViewById(R.id.tvStationName);
            tvLocation = itemView.findViewById(R.id.tvLocation);
            tvCapacity = itemView.findViewById(R.id.tvCapacity);
            tvBatterySlots = itemView.findViewById(R.id.tvBatterySlots);
            tvRate = itemView.findViewById(R.id.tvRate);
            tvDistance = itemView.findViewById(R.id.tvDistance);
        }
    }
}
