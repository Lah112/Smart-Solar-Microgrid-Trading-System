package com.smartsolar.app.adapters;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.smartsolar.app.R;
import com.smartsolar.app.models.Reservation;

import java.util.List;

public class ReservationAdapter extends RecyclerView.Adapter<ReservationAdapter.ViewHolder> {

    private final Context context;
    private final List<Reservation> reservations;
    private final OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(Reservation reservation);
    }

    public ReservationAdapter(Context context, List<Reservation> reservations, OnItemClickListener listener) {
        this.context = context;
        this.reservations = reservations;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_reservation, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Reservation r = reservations.get(position);

        holder.tvResNo.setText(r.getReservationNumber());
        holder.tvStationName.setText(r.getStationName() != null ? r.getStationName() : r.getStationCode());

        String cleanDate = r.getReservationDate() != null && r.getReservationDate().contains("T")
                ? r.getReservationDate().split("T")[0]
                : r.getReservationDate();
        holder.tvDateTime.setText(cleanDate + " (" + r.getStartTime() + " - " + r.getEndTime() + ")");

        holder.tvEnergyAmount.setText(r.getEnergyAmountKWh() + " kWh");
        holder.tvTotalAmount.setText("Rs. " + r.getTotalAmount());
        holder.tvStatus.setText(r.getStatus());

        // Status styling
        if ("Approved".equalsIgnoreCase(r.getStatus()) || "Completed".equalsIgnoreCase(r.getStatus())) {
            holder.tvStatus.setTextColor(Color.parseColor("#10B981"));
        } else if ("Pending".equalsIgnoreCase(r.getStatus())) {
            holder.tvStatus.setTextColor(Color.parseColor("#F59E0B"));
        } else {
            holder.tvStatus.setTextColor(Color.parseColor("#EF4444"));
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(r);
            }
        });
    }

    @Override
    public int getItemCount() {
        return reservations.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvResNo, tvStationName, tvDateTime, tvEnergyAmount, tvTotalAmount, tvStatus;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvResNo = itemView.findViewById(R.id.tvResNo);
            tvStationName = itemView.findViewById(R.id.tvStationName);
            tvDateTime = itemView.findViewById(R.id.tvDateTime);
            tvEnergyAmount = itemView.findViewById(R.id.tvEnergyAmount);
            tvTotalAmount = itemView.findViewById(R.id.tvTotalAmount);
            tvStatus = itemView.findViewById(R.id.tvStatus);
        }
    }
}
