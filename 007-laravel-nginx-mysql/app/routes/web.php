<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/db-test', function () {
    $database = DB::select('select database() as db');

    return [
        'status' => 'ok',
        'database' => $database[0]->db,
    ];
});
